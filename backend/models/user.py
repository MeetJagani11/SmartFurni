from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password_hash: str
    is_active: bool = True
    is_admin: bool = False
    profile_picture: Optional[str] = None
    shipping_address: Optional[dict] = None
    reset_token: Optional[str] = None
    reset_token_expiry: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    shipping_address: Optional[dict] = None

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_admin: Optional[bool] = None
    password: Optional[str] = None # Optional password reset by admin
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    name: Optional[str] = "Unknown"
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False
    profile_picture: Optional[str] = None
    shipping_address: Optional[dict] = None
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str
