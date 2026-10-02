from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class SmartSuggestion(BaseModel):
    user_id: str
    type: str  # e.g., "social_proof", "preference_match"
    message: str
    product_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False
    metadata: Optional[Dict[str, Any]] = None

class SmartSuggestionCreate(BaseModel):
    user_id: str
    type: str
    message: str
    product_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
