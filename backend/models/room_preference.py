from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId
from models.database_models import PyObjectId

class RoomPreferenceBase(BaseModel):
    user_id: str
    room_type: str # e.g., 'living_room', 'bedroom', 'dining_room'
    length: float # in meters or feet
    width: float
    height: float
    budget: float
    preferred_style: Optional[str] = None # e.g., 'modern', 'classic', 'minimalist'

class RoomPreferenceCreate(RoomPreferenceBase):
    pass

class RoomPreferenceUpdate(BaseModel):
    room_type: Optional[str] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    budget: Optional[float] = None
    preferred_style: Optional[str] = None

class RoomPreference(RoomPreferenceBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
