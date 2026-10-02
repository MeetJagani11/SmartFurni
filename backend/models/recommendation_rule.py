from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from bson import ObjectId
from models.database_models import PyObjectId

class RecommendationRuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    room_size_range: str # 'small', 'medium', 'large'
    budget_range: str # 'budget', 'standard', 'premium'
    style: str # 'modern', 'classic', 'minimalist', etc.
    recommended_category: str
    is_active: bool = True
    priority: int = 0

class RecommendationRuleCreate(RecommendationRuleBase):
    pass

class RecommendationRule(RecommendationRuleBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
