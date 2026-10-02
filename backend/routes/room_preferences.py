from fastapi import APIRouter, HTTPException, Depends
from models.room_preference import RoomPreference, RoomPreferenceCreate, RoomPreferenceUpdate
from models.user import User
from auth.auth_middleware import get_current_user
from database import get_database

router = APIRouter()
db = get_database()

@router.get("/", response_model=RoomPreference)
async def get_room_preference(current_user: User = Depends(get_current_user)):
    """Get the current user's room preferences."""
    pref = await db.room_preferences.find_one({"user_id": current_user.id})
    if not pref:
        raise HTTPException(status_code=404, detail="Room preferences not found")
    return RoomPreference(**pref)

@router.post("/", response_model=RoomPreference, status_code=201)
async def create_room_preference(
    pref_data: RoomPreferenceCreate,
    current_user: User = Depends(get_current_user)
):
    """Create or overwrite the user's room preferences."""
    pref_data.user_id = current_user.id
    
    # Check if exists, overwrite if so
    existing = await db.room_preferences.find_one({"user_id": current_user.id})
    if existing:
         updated = await db.room_preferences.find_one_and_update(
             {"user_id": current_user.id},
             {"$set": pref_data.model_dump(exclude={"user_id"})},
             return_document=True
         )
         return RoomPreference(**updated)
         
    new_pref = RoomPreference(**pref_data.model_dump())
    result = await db.room_preferences.insert_one(new_pref.model_dump(by_alias=True))
    new_pref.id = result.inserted_id
    return new_pref

@router.put("/", response_model=RoomPreference)
async def update_room_preference(
    pref_update: RoomPreferenceUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update specific fields of the user's room preferences."""
    update_data = {k: v for k, v in pref_update.model_dump(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        pref = await db.room_preferences.find_one({"user_id": current_user.id})
        return RoomPreference(**pref) if pref else None
        
    result = await db.room_preferences.find_one_and_update(
        {"user_id": current_user.id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Room preferences not found")
        
    return RoomPreference(**result)
