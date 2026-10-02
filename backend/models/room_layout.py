from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class LayoutItem(BaseModel):
    product_id: str
    name: str = "Furniture"
    x: float
    y: float
    rotation: float = 0.0
    width: float = 0.5
    length: float = 0.5
    image: Optional[str] = None

class RoomLayoutBase(BaseModel):
    name: str = "My Room Design"
    room_length: float = 5.0
    room_width: float = 5.0
    items: List[LayoutItem] = []

class RoomLayoutCreate(RoomLayoutBase):
    pass

class RoomLayout(RoomLayoutBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
