from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    image: str
    description: Optional[str] = None
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    slug: str
    image: str
    description: Optional[str] = None
    order: int = 0
    active: bool = True
