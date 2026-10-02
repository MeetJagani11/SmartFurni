from fastapi import APIRouter, Depends, HTTPException
from models.user import User
from auth.auth_middleware import get_current_user
from services.suggestion_service import get_user_suggestions
from database import get_database
from bson import ObjectId

router = APIRouter()
db = get_database()

@router.get("/")
async def get_suggestions(current_user: User = Depends(get_current_user)):
    """Fetch active suggestions for the current user."""
    suggestions = await get_user_suggestions(current_user.id)
    # Convert ObjectIDs to strings
    for s in suggestions:
        s["_id"] = str(s["_id"])
    return suggestions

@router.post("/{suggestion_id}/read")
async def mark_suggestion_read(suggestion_id: str, current_user: User = Depends(get_current_user)):
    """Mark a suggestion as read."""
    result = await db.suggestions.update_one(
        {"_id": suggestion_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        # Try with ObjectId
        try:
            result = await db.suggestions.update_one(
                {"_id": ObjectId(suggestion_id), "user_id": current_user.id},
                {"$set": {"is_read": True}}
            )
        except:
            pass
            
    return {"status": "success"}
