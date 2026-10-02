from typing import List, Dict, Any
from database import get_database
from models.product import Product

db = get_database()

async def generate_recommendations(user_input: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate furniture recommendations based on user inputs:
    - room_size (sq ft)
    - room_type (category)
    - budget (max price)
    - style (modern, classic, etc.)
    """
    room_size = float(user_input.get("room_size") or 0)
    room_type = user_input.get("room_type")
    budget = float(user_input.get("budget") or 1000000) # Default high budget if missing
    style = user_input.get("style", "").lower()

    # 1. Fetch relevant Recommendation Rules
    active_rules = await db.recommendation_rules.find({"is_active": True}).to_list(100)
    boosted_categories = {} # category -> boost_score
    
    # Map raw inputs to ranges for rule matching
    room_range = "small" if room_size < 150 else ("medium" if room_size <= 300 else "large")
    budget_range = "budget" if budget < 50000 else ("standard" if budget <= 150000 else "premium")
    
    for rule in active_rules:
        # Match rule against user context
        if (rule.get("room_size_range") == room_range and 
            rule.get("budget_range") == budget_range and 
            (not rule.get("style") or rule.get("style").lower() == style)):
            
            cat = rule.get("recommended_category")
            # Boost score based on rule priority (priority / 100)
            boost_val = rule.get("priority", 0) / 100.0
            boosted_categories[cat] = max(boosted_categories.get(cat, 0), boost_val)

    # 2. Base Query: Filter by Budget
    query = {"smartFurniPrice": {"$lte": budget}}
    
    # Fetch candidates (more than 16 to allow ranking to work)
    cursor = db.products.find(query).limit(300)
    candidates = await cursor.to_list(length=300)

    # 3. Advanced Scoring Mechanism
    scored_products = []
    for prod in candidates:
        score = 0.0
        prod_cat = prod.get("category")
        
        # A. Room Type Match (If explicit)
        if room_type and prod_cat and room_type.lower() == prod_cat.lower():
            score += 0.30 # Strong base for exact match
            
        # B. Strategic Rule Boost (FROM DATABASE RULES)
        if prod_cat in boosted_categories:
            score += boosted_categories[prod_cat]

        # C. Style Match Score (Weight: 25%)
        prod_text = (str(prod.get("name", "")) + " " + str(prod.get("description", ""))).lower()
        if style:
            if style in prod_text:
                score += 0.25
            else:
                styles_map = {
                    "modern": ["contemporary", "minimalist", "sleek", "modern"],
                    "classic": ["traditional", "vintage", "antique", "classic", "royal"],
                    "minimal": ["minimalist", "simple", "clean", "scandinavian"],
                    "industrial": ["metal", "raw", "unfinished", "industrial", "loft"]
                }
                for key, synonyms in styles_map.items():
                    if style == key and any(s in prod_text for s in synonyms):
                        score += 0.15
                        break

        # D. Size / Footprint Compatibility (Weight: 20%)
        if room_size > 0:
            l = prod.get("length") or 0.6
            w = prod.get("width") or 0.6
            footprint_sq_m = l * w
            footprint_sq_ft = footprint_sq_m * 10.764
            
            usage_ratio = footprint_sq_ft / room_size
            if usage_ratio > 0.3: # Too large
                score += 0.0
            elif usage_ratio > 0.2: # A bit tight
                score += 0.05
            elif 0.05 <= usage_ratio <= 0.2: # Perfect Fit
                score += 0.20
            else: # A bit small
                score += 0.10
        else:
            score += 0.10 # Neutral fallback

        # E. Sustainability Priority (Weight: 15%)
        sus_raw = float(prod.get("sustainabilityScore") or prod.get("sustainability_score") or 5)
        score += (sus_raw / 10.0) * 0.15
        
        # F. Popularity & Quality (Weight: 10%)
        rating = float(prod.get("rating") or 0)
        reviews = min(float(prod.get("reviews") or 0), 100) / 100.0
        score += ((rating / 5.0) * 0.07) + (reviews * 0.03)

        # Append match percentage to product
        prod["ai_match_score"] = min(100, round(score * 100))
        scored_products.append({"product": prod, "score": score})

    # Sort by score descending and take top 16
    scored_products.sort(key=lambda x: x["score"], reverse=True)
    results = [item["product"] for item in scored_products[:16]]
    
    return results
