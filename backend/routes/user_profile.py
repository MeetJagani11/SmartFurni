from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from models.user import User, UserUpdate, UserResponse
from auth.auth_middleware import get_current_user
from database import get_database
from typing import Optional
import os
from pathlib import Path
import shutil
import uuid

router = APIRouter()
db = get_database()

@router.get("/", response_model=UserResponse)
async def read_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current logged-in user profile
    """
    return UserResponse(**current_user.model_dump())

@router.put("/", response_model=UserResponse)
async def update_user_profile(
    profile_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update current logged-in user profile
    """
    try:
        update_data = {k: v for k, v in profile_update.model_dump(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            return UserResponse(**current_user.model_dump())
            
        # If email is being updated, check if it's already taken
        if "email" in update_data and update_data["email"] != current_user.email:
            existing_user = await db.users.find_one({"email": update_data["email"]})
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered by another user")
        
        result = await db.users.find_one_and_update(
            {"id": current_user.id},
            {"$set": update_data},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
            
        return UserResponse(**result)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.post("/upload-picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and update profile picture
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Setup paths
    ROOT_DIR = Path(__file__).parent.parent
    UPLOAD_DIR = ROOT_DIR / "uploads" / "profiles"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update user in database
        # Store relative URL for the frontend
        picture_url = f"/uploads/profiles/{filename}"
        
        # Delete old file if exists later (optional improvement)
        
        result = await db.users.find_one_and_update(
            {"id": current_user.id},
            {"$set": {"profile_picture": picture_url}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
            
        return UserResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
