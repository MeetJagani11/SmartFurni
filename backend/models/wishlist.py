from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from bson import ObjectId
from models.database_models import PyObjectId

class WishlistBase(BaseModel):
    user_id: str
    product_ids: List[str] = []

class WishlistCreate(WishlistBase):
    pass

class Wishlist(WishlistBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
