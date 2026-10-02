from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class OrderItem(BaseModel):
    id: str
    name: str
    image: str
    smart_furni_price: float = Field(..., alias="smartFurniPrice")
    quantity: int

    model_config = ConfigDict(populate_by_name=True)

class ShippingAddress(BaseModel):
    name: str
    street: str
    city: str
    pincode: Optional[str] = None
    state: str
    phone: str

class CardDetails(BaseModel):
    number: str
    expiry: str
    cvv: str
    name: str

class TrackingHistoryEntry(BaseModel):
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    location: Optional[str] = None
    note: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping_address: ShippingAddress = Field(..., alias="shippingAddress")
    payment_method: str = Field(..., alias="paymentMethod")
    payment_details: Optional[Dict[str, Any]] = Field(None, alias="paymentDetails")
    upi_id: Optional[str] = Field(None, alias="upiId")
    total_amount: float = Field(..., alias="totalAmount")
    
    model_config = ConfigDict(populate_by_name=True)

class Order(OrderCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = Field(None, alias="userId")
    status: str = "pending"
    tracking_history: List[TrackingHistoryEntry] = Field(default_factory=list, alias="trackingHistory")
    estimated_delivery: Optional[datetime] = Field(None, alias="estimatedDelivery")
    completed_at: Optional[datetime] = Field(None, alias="completedAt")
    return_requested_at: Optional[datetime] = Field(None, alias="returnRequestedAt")
    return_reason: Optional[str] = Field(None, alias="returnReason")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)
