from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    image: str
    images: Optional[List[str]] = []
    market_price: float = Field(..., alias="marketPrice")
    smart_furni_price: float = Field(..., alias="smartFurniPrice")
    discount: int
    rating: Optional[float] = 0.0
    reviews: Optional[int] = 0
    stock_status: str = Field("in_stock", alias="stockStatus")
    featured: bool = False
    new_launch: bool = False
    best_selling: bool = False
    sustainability_score: int = Field(5, ge=1, le=10, alias="sustainabilityScore")
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    ai_match_score: Optional[int] = Field(None, alias="aiMatchScore")
    specifications: Optional[dict] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    image: str
    images: Optional[List[str]] = []
    market_price: float = Field(..., alias="marketPrice")
    smart_furni_price: float = Field(..., alias="smartFurniPrice")
    discount: int
    rating: Optional[float] = 0.0
    reviews: Optional[int] = 0
    stock_status: str = Field("in_stock", alias="stockStatus")
    featured: bool = False
    new_launch: bool = False
    best_selling: bool = False
    sustainability_score: int = Field(5, ge=1, le=10, alias="sustainabilityScore")
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    specifications: Optional[dict] = {}
    
    model_config = ConfigDict(populate_by_name=True)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    market_price: Optional[float] = Field(None, alias="marketPrice")
    smart_furni_price: Optional[float] = Field(None, alias="smartFurniPrice")
    discount: Optional[int] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    stock_status: Optional[str] = Field(None, alias="stockStatus")
    featured: Optional[bool] = None
    new_launch: Optional[bool] = None
    best_selling: Optional[bool] = None
    sustainability_score: Optional[int] = Field(None, ge=1, le=10, alias="sustainabilityScore")
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    specifications: Optional[dict] = None
    
    model_config = ConfigDict(populate_by_name=True)
