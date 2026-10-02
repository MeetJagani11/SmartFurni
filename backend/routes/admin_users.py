from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
from models.user import User, UserResponse, AdminUserCreate, AdminUserUpdate
from auth.auth_middleware import get_current_admin_user
from database import get_database
from bson import ObjectId

router = APIRouter()
db = get_database()

@router.get("/")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get all users (Admin only)
    """
    try:
        cursor = db.users.find().skip(skip).limit(limit)
        users_raw = await cursor.to_list(length=limit)
        
        parsed_users = []
        for user in users_raw:
            try:
                # Manually convert ObjectId to string if present
                if "_id" in user:
                    user["_id"] = str(user["_id"])
                
                # We return the dict directly but we attempt to validate it for internal consistency
                UserResponse(**user) 
                parsed_users.append(user)
            except Exception as parse_error:
                print(f"ERROR: Failed to parse user {user.get('email', 'unknown')}: {str(parse_error)}")
                # Even if validation fails, we return the raw dict so the UI can at least show SOMETHING
                parsed_users.append(user)
                
        return parsed_users
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: AdminUserCreate,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Create a new user (Admin only)
    """
    try:
        from auth.auth_controller import get_password_hash
        user_dict = user_data.model_dump()
        user_dict["email"] = user_dict["email"].lower()
        password = user_dict.pop("password")
        user_dict["password_hash"] = get_password_hash(password)
        
        new_user = User(**user_dict)
        await db.users.insert_one(new_user.model_dump())
        return UserResponse(**new_user.model_dump())
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: AdminUserUpdate,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update a user's details like role or active status (Admin only)
    """
    if user_id == current_admin.id and update_data.is_admin is False:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove admin privileges from yourself"
        )
        
    try:
        from auth.auth_controller import get_password_hash
        user_dict = update_data.model_dump(exclude_unset=True)
        
        if "password" in user_dict:
            password = user_dict.pop("password")
            user_dict["password_hash"] = get_password_hash(password)
            
        user_dict["updated_at"] = datetime.utcnow()
        
        match_filter = {"id": user_id}
        if ObjectId.is_valid(user_id):
            match_filter = {"$or": [{"id": user_id}, {"_id": ObjectId(user_id)}]}

        result = await db.users.find_one_and_update(
            match_filter,
            {"$set": user_dict},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse(**result)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete a user (Admin only)
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )
        
    try:
        match_filter = {"id": user_id}
        if ObjectId.is_valid(user_id):
            match_filter = {"$or": [{"id": user_id}, {"_id": ObjectId(user_id)}]}
            
        result = await db.users.delete_one(match_filter)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
