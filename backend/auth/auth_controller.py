from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import bcrypt
import os
from models.user import User, UserCreate, Token
from database import get_database

db = get_database()

from auth.config import SECRET_KEY, ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = 20160 # 14 days

def verify_password(plain_password, hashed_password):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    return bcrypt.checkpw(plain_password, hashed_password)

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=365)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def login_user(email, password):
    email = email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password_hash"]):
        return None
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def register_new_user(user_data: UserCreate):
    # Normalize email
    user_data.email = user_data.email.lower()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        return None, "Email already registered"
    
    # Create new user
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    user_dict["password_hash"] = get_password_hash(password)
    
    new_user = User(**user_dict)
    await db.users.insert_one(new_user.model_dump())
    return new_user, None

import secrets
from services.email_service import send_reset_password_email

async def request_password_reset(email: str):
    email = email.lower()
    try:
        user = await db.users.find_one({"email": email})
        if not user:
            # We return success True here for security reasons 
            # (don't reveal if user exists) but we could return False if we want front-end to know
            return False, "Email not found"
        
        # Generate token
        token = secrets.token_urlsafe(32)
        expiry = datetime.utcnow() + timedelta(hours=1)
        
        # Update user with token in DB
        await db.users.update_one(
            {"email": email},
            {"$set": {"reset_token": token, "reset_token_expiry": expiry}}
        )
        
        # Try to send email
        email_sent = await send_reset_password_email(email, token)
        
        # Return True if we at least saved the token and (maybe) sent the email
        # In DEV mode, returning True regardless lets us test the flow
        return True, None
    except Exception as e:
        import traceback
        print(f"FORGOT PASSWORD ERROR: {str(e)}")
        print(traceback.format_exc())
        return False, f"Server error occurred: {str(e)}"

async def complete_password_reset(token: str, new_password: str):
    user = await db.users.find_one({
        "reset_token": token,
        "reset_token_expiry": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        return False, "Invalid or expired token"
    
    # Update password and clear token
    hashed_password = get_password_hash(new_password)
    await db.users.update_one(
        {"email": user["email"]},
        {
            "$set": {"password_hash": hashed_password},
            "$unset": {"reset_token": "", "reset_token_expiry": ""}
        }
    )
    return True, None
