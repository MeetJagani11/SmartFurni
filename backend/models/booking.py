from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    store: str
    product_interest: str
    status: str = "pending"  # pending, confirmed, completed, cancelled
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(BaseModel):
    phone: str
    store: str
    product_interest: str
    notes: Optional[str] = None
