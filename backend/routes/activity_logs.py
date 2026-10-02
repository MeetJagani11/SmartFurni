from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models.activity_log import ActivityLog, ActivityLogCreate
from models.user import User
from auth.auth_middleware import get_current_user
from database import get_database

router = APIRouter()
db = get_database()

from services.activity_service import log_activity_bg

@router.post("/", status_code=202)
async def create_activity_log(
    activity_data: ActivityLogCreate, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Log an activity for the user asynchronously. Used for analytics and AI models.
    """
    activity_data.user_id = current_user.id
    new_log = ActivityLog(**activity_data.model_dump(exclude_unset=True))
    
    background_tasks.add_task(log_activity_bg, new_log.model_dump(by_alias=True))
    return {"message": "Activity logged"}
