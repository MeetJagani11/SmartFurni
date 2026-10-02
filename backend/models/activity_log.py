from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from models.database_models import PyObjectId

class ActivityLogBase(BaseModel):
    user_id: Optional[str] = None
    action: str # e.g., 'view_product', 'add_to_cart', 'purchase', 'search'
    entity_id: Optional[str] = None # e.g., product_id
    metadata: Optional[Dict[str, Any]] = None # Extra info

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
