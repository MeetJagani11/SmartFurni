from fastapi import APIRouter, Depends, HTTPException, status
from auth.auth_middleware import get_current_admin_user
from models.user import User
from services.backup_service import perform_backup, restore_backup, list_backups
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_backups(current_user: User = Depends(get_current_admin_user)):
    """List available backups."""
    return list_backups()

@router.post("/trigger")
async def trigger_backup(current_user: User = Depends(get_current_admin_user)):
    """Manually trigger a backup."""
    backup_file = await perform_backup()
    if backup_file:
        return {"message": "Backup created successfully", "file": backup_file}
    else:
        raise HTTPException(status_code=500, detail="Backup failed")

@router.post("/{backup_name}/restore")
async def restore_db(backup_name: str, current_user: User = Depends(get_current_admin_user)):
    """Restore database from a specific backup."""
    success = await restore_backup(backup_name)
    if success:
        return {"message": "Database restored successfully"}
    else:
        raise HTTPException(status_code=500, detail="Restore failed. Please check server logs.")
