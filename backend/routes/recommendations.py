from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.product import Product
from models.user import User
from auth.auth_middleware import get_current_user
from database import get_database
from routes.planner import extract_dimensions

from recommendation_engine.engine import generate_recommendations as engine_generate
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
db = get_database()

class RecommendationInput(BaseModel):
    room_size: Optional[float] = None
    room_type: Optional[str] = None
    budget: Optional[float] = None
    style: Optional[str] = None

@router.post("/generate", response_model=List[Product])
async def generate_targeted_recommendations(user_input: RecommendationInput):
    """
    Generate targeted furniture recommendations based on explicit user input.
    """
    try:
        results = await engine_generate(user_input.model_dump())
        return [Product(**p) for p in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Engine failure: {str(e)}")


@router.get("/user/{user_id}", response_model=List[Product])
async def get_user_recommendations(user_id: str, limit: int = 5):
    """
    Get personalized recommendations for a user.
    Phase 1 Heuristic:
    - Look at user's past orders to find their most bought categories.
    - If no orders, return top featured and best-selling products.
    """
    try:
        # 0. Fetch System Configurations for Weights
        config_cursor = db.system_configs.find({})
        configs = {c["key"]: c["value"] for c in await config_cursor.to_list(100)}
        
        w_dim = configs.get("rec_weight_dimensions", 0.30)
        w_budget = configs.get("rec_weight_budget", 0.25)
        w_sus = configs.get("rec_weight_sustainability", 0.15)
        w_pop = configs.get("rec_weight_popularity", 0.15)
        w_style = configs.get("rec_weight_style", 0.15)

        # 1. Fetch user's past orders to understand preferences
        orders = await db.orders.find({"userId": user_id}).to_list(100)
        
        preferred_categories = set()
        for order in orders:
            for item in order.get("items", []):
                # Retrieve product to find its category
                product = await db.products.find_one({"id": item["id"]})
                if product and "category" in product:
                    preferred_categories.add(product["category"])
        
        # 2. Fetch Room Preference for advanced ranking / filtering
        room_pref = await db.room_preferences.find_one({"user_id": user_id})
        
        # 3. Base Query
        query = {}
        if preferred_categories:
            query["category"] = {"$in": list(preferred_categories)}
        else:
            # Fallback for new users
            query["$or"] = [{"featured": True}, {"best_selling": True}]
            
        # Instead of strict filtering, fetch a larger pool of candidates (e.g., 50) and score them
        cursor = db.products.find(query).limit(50)
        candidates = await cursor.to_list(length=50)
        
        # If we didn't find enough, pad with general items
        if len(candidates) < limit:
            needed = max(limit, 50 - len(candidates))
            exclude_ids = [p["id"] for p in candidates]
            fallback_cursor = db.products.find({"id": {"$nin": exclude_ids}}).limit(needed)
            fallback_products = await fallback_cursor.to_list(length=needed)
            candidates.extend(fallback_products)

        # 4. Gather popularity data from activity logs
        # Ensure we only use products that have an 'id' (fallback to _id string if needed)
        for p in candidates:
            if "id" not in p:
                p["id"] = str(p["_id"])

        candidate_ids = [p["id"] for p in candidates]
        pipeline = [
            {"$match": {"entity_id": {"$in": candidate_ids}, "action": {"$in": ["view_product", "add_to_cart", "compare_product", "add_to_wishlist"]}}},
            {"$group": {"_id": "$entity_id", "score": {"$sum": 1}}}
        ]
        activity_results = await db.activity_logs.aggregate(pipeline).to_list(None)
        popularity_map = {item["_id"]: item["score"] for item in activity_results}
        max_popularity = max(popularity_map.values()) if popularity_map else 1

        scored_products = []
        
        for prod in candidates:
            # 1. Room Dimension Compatibility Score (Weight: w_dim)
            dim_score = 1.0
            if room_pref and room_pref.get("length") and room_pref.get("width"):
                l, w = extract_dimensions(prod)
                prod_area = l * w
                room_area = room_pref["length"] * room_pref["width"]
                if prod_area > room_area:
                    dim_score = 0.0
                elif prod_area > room_area * 0.4:
                    dim_score = 0.6
                else:
                    dim_score = 1.0
            
            # 2. Budget Proximity Score (Weight: w_budget)
            budget_score = 1.0
            if room_pref and room_pref.get("budget"):
                budget = room_pref["budget"]
                price = prod.get("smartFurniPrice", 0)
                if price <= budget:
                    budget_score = 1.0 - ((budget - price) / budget * 0.1)
                else:
                    budget_score = max(0.0, 1.0 - ((price - budget) / budget))
            
            # 3. Sustainability Weight (Weight: w_sus)
            sus_score = (prod.get("sustainability_score") or 5) / 10.0
            
            # 4. Popularity Score from Activity Logs (Weight: w_pop)
            pop_count = popularity_map.get(prod["id"], 0)
            pop_score = pop_count / max_popularity if max_popularity > 0 else 0.0
            
            # 5. Style/Category Match (Weight: w_style)
            # Check if this matches user's preferred style keyword in category/name
            style_score = 0.0
            if room_pref and room_pref.get("preferred_style"):
                style = room_pref["preferred_style"].lower()
                if style in str(prod.get("category", "")).lower() or style in str(prod.get("name", "")).lower():
                    style_score = 1.0
                    
            # Composite formula using dynamic weights
            total_score = (w_dim * dim_score) + (w_budget * budget_score) + (w_sus * sus_score) + (w_pop * pop_score) + (w_style * style_score)
                    
            scored_products.append({"product": prod, "score": total_score})
            
        # 5. Sort by highest combined scored
        scored_products.sort(key=lambda x: x["score"], reverse=True)
        
        # Take the top 'limit' items
        top_products = [item["product"] for item in scored_products[:limit]]
            
        return [Product(**p) for p in top_products]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/product/{product_id}", response_model=List[Product])
async def get_similar_products(product_id: str, limit: int = 4):
    """
    Get products similar to a specific product.
    Phase 1 Heuristic:
    - Same category
    - Similar price range (+/- 30%)
    """
    try:
        source_product = await db.products.find_one({"id": product_id})
        if not source_product:
            raise HTTPException(status_code=404, detail="Source product not found")
            
        category = source_product.get("category")
        price = source_product.get("smartFurniPrice", 0)
        
        min_price = price * 0.7
        max_price = price * 1.3
        
        query = {
            "id": {"$ne": product_id},
            "category": category,
            "smartFurniPrice": {"$gte": min_price, "$lte": max_price}
        }
        
        cursor = db.products.find(query).limit(limit)
        products = await cursor.to_list(length=limit)
        
        # Fallback if not enough similar items found in price range
        if len(products) < limit:
            needed = limit - len(products)
            # Ensure all products have an 'id'
            for p in products:
                if "id" not in p:
                    p["id"] = str(p["_id"])
            exclude_ids = [product_id] + [p["id"] for p in products]
            fallback_query = {
                 "id": {"$nin": exclude_ids},
                 "category": category
            }
            fallback_cursor = db.products.find(fallback_query).limit(needed)
            fallback_products = await fallback_cursor.to_list(length=needed)
            products.extend(fallback_products)
            
        return [Product(**p) for p in products]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to fetch similar products: {str(e)}")
