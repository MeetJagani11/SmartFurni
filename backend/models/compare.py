from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from bson import ObjectId
from models.product import Product
from models.database_models import PyObjectId

class CompareBase(BaseModel):
    user_id: str
    product_ids: List[str] = []

class CompareCreate(CompareBase):
    pass

class Compare(CompareBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
