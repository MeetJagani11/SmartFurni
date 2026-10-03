from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate
from database import get_database
import os
from fastapi import BackgroundTasks, Depends
from routes.activity_logs import log_activity_bg
from models.activity_log import ActivityLog
from auth.auth_middleware import get_current_user, get_optional_current_user
from models.user import User

router = APIRouter(prefix="/products", tags=["products"])
db = get_database()

@router.get("/", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    new_launch: Optional[bool] = None,
    best_selling: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=2000),
    background_tasks: BackgroundTasks = None,
    current_user: Optional[User] = Depends(get_optional_current_user) # Optional for public routes
):
    """
    Get all products with optional filters and sorting
    """
    if search and background_tasks:
        log_entry = ActivityLog(
            action="search",
            user_id=getattr(current_user, 'id', None),
            metadata={"query": search}
        )
        background_tasks.add_task(log_activity_bg, log_entry.model_dump(by_alias=True))

    query_parts = []
    
    if category:
        if "," in category:
            categories = [c.strip() for c in category.split(",")]
            query_parts.append({"$or": [
                {"category": {"$in": categories}},
                {"category_slug": {"$in": [c.lower() for c in categories]}}
            ]})
        else:
            query_parts.append({"$or": [
                {"category": category},
                {"category_slug": category.lower()}
            ]})

    if search:
        query_parts.append({"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
            {"subcategory": {"$regex": search, "$options": "i"}}
        ]})

    if featured is not None:
        query_parts.append({"featured": featured})
    if new_launch is not None:
        query_parts.append({"new_launch": new_launch})
    if best_selling is not None:
        query_parts.append({"best_selling": best_selling})
        
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query_parts.append({"smartFurniPrice": price_query})
        
    # Build final query
    final_query = {"$and": query_parts} if query_parts else {}
        
    cursor = db.products.find(final_query)
    
    if sort_by == "price_asc":
        cursor = cursor.sort("smartFurniPrice", 1)
    elif sort_by == "price_desc":
        cursor = cursor.sort("smartFurniPrice", -1)
    elif sort_by == "newest":
        cursor = cursor.sort("created_at", -1)
        
    products_db = await cursor.skip(skip).limit(limit).to_list(limit)
    return [Product(**p) for p in products_db]

@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get a single product by ID
    """
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Log product view activity
    log_entry = ActivityLog(
        action="view_product",
        user_id=getattr(current_user, 'id', None),
        entity_id=product_id
    )
    background_tasks.add_task(log_activity_bg, log_entry.model_dump(by_alias=True))
    
    return Product(**product)
