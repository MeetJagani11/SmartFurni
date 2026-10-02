from database import get_database
from models.suggestion import SmartSuggestion, SmartSuggestionCreate
from datetime import datetime
import random

db = get_database()

async def generate_suggestions(user_id: str):
    """
    Analyzes user behavior and generates personalized suggestions.
    """
    suggestions = []
    
    # 1. Fetch user data
    user = await db.users.find_one({"_id": user_id})
    if not user:
        return []
    
    # 2. Analyze recent searches
    recent_logs = await db.activity_logs.find({"user_id": user_id, "action": "search"}).sort("timestamp", -1).limit(5).to_list(None)
    
    # 3. Analyze similar room preferences (Social Proof)
    room_pref = await db.room_preferences.find_one({"user_id": user_id})
    if room_pref:
        room_type = room_pref.get("room_type")
        # Find others with same room type who liked products
        similar_others = await db.activity_logs.find({
            "action": "wishlist_add", 
            "metadata.room_type": room_type,
            "user_id": {"$ne": user_id}
        }).limit(10).to_list(None)
        
        if similar_others:
            # Pick a product someone else liked
            target_log = random.choice(similar_others)
            product_id = target_log.get("metadata", {}).get("product_id")
            if product_id:
                product = await db.products.find_one({"_id": product_id})
                if product:
                    suggestions.append(SmartSuggestionCreate(
                        user_id=user_id,
                        type="social_proof",
                        message=f"Users with similar {room_type}s loved the {product['name']}!",
                        product_id=product_id,
                        metadata={"room_type": room_type}
                    ))

    # 4. Fallback or general interest
    if not suggestions:
        # Check what's trending
        trending = await db.products.find({"best_selling": True}).limit(3).to_list(None)
        if trending:
            p = random.choice(trending)
            suggestions.append(SmartSuggestionCreate(
                user_id=user_id,
                type="trending",
                message=f"Don't miss out! People are currently eyeing the {p['name']}.",
                product_id=p["_id"]
            ))

    # Save to DB if not already exists (basic deduplication by message)
    for s_data in suggestions:
        existing = await db.suggestions.find_one({"user_id": user_id, "message": s_data.message})
        if not existing:
            await db.suggestions.insert_one(s_data.model_dump())
            
    return suggestions

async def get_user_suggestions(user_id: str):
    # Auto-generate on fetch to keep it fresh
    await generate_suggestions(user_id)
    return await db.suggestions.find({"user_id": user_id, "is_read": False}).sort("created_at", -1).to_list(None)
