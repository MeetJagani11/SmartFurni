from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from models.user import User, UserCreate, UserLogin, UserResponse, Token
from auth.auth_controller import login_user, register_new_user, request_password_reset, complete_password_reset
from pydantic import BaseModel, EmailStr
from auth.auth_middleware import get_current_user
from fastapi import BackgroundTasks
from services.activity_service import log_activity_bg
from models.activity_log import ActivityLog
import os
from database import get_database

router = APIRouter()
db = get_database()

@router.post("/register", response_model=UserResponse)
async def register_route(user: UserCreate):
    try:
        new_user, error = await register_new_user(user)
        if error:
            raise HTTPException(status_code=400, detail=error)
        return UserResponse(**new_user.model_dump())
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@router.post("/login", response_model=Token)
async def login_route(form_data: UserLogin, background_tasks: BackgroundTasks):
    try:
        token_data = await login_user(form_data.email, form_data.password)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Log login activity
        log_entry = ActivityLog(
            action="login",
            metadata={"email": form_data.email}
        )
        background_tasks.add_task(log_activity_bg, log_entry.model_dump(by_alias=True))
        
        return token_data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@router.get("/me", response_model=UserResponse)
async def me_route(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.model_dump())

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
async def forgot_password_route(request: ForgotPasswordRequest):
    try:
        # Check if user exists
        user = await db.users.find_one({"email": request.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not registered with this email address."
            )

        # Generate token and save
        success, error = await request_password_reset(request.email)
        
        # Get the latest token from DB to show in dev
        user_updated = await db.users.find_one({"email": request.email})
        token = user_updated.get("reset_token")
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={token}"

        # Return success with a helpful message for dev
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Reset link has been generated.",
                "dev_link": reset_link, # Returning this so the UI can show it in console/UI for easy testing
                "info": "For real emails, please set a valid SMTP_PASSWORD in your .env file."
            }
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
async def reset_password_route(request: ResetPasswordRequest):
    success, error = await complete_password_reset(request.token, request.new_password)
    if not success:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Password reset successful. You can now login with your new password."}
