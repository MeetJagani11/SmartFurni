from fastapi import APIRouter, HTTPException, Depends
from models.system_config import SystemConfig, SystemConfigCreate
from models.user import User
from auth.auth_middleware import get_current_admin_user
from database import get_database
from typing import List

router = APIRouter()
db = get_database()

@router.get("/", response_model=List[SystemConfig])
async def get_all_configs(current_admin: User = Depends(get_current_admin_user)):
    """Admin: Get all system configurations."""
    configs = await db.system_configs.find().to_list(100)
    return [SystemConfig(**c) for c in configs]

@router.get("/{key}", response_model=SystemConfig)
async def get_config_by_key(key: str):
    """
    Public/Internal: Get a specific system config by key.
    Used by frontend or backend logic to determine thresholds, flags, etc.
    """
    config = await db.system_configs.find_one({"key": key})
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return SystemConfig(**config)

@router.post("/", response_model=SystemConfig, status_code=201)
async def create_or_update_config(
    config: SystemConfigCreate, 
    current_admin: User = Depends(get_current_admin_user)
):
    """Admin: Set or update a system configuration."""
    existing = await db.system_configs.find_one({"key": config.key})
    
    if existing:
        updated = await db.system_configs.find_one_and_update(
            {"key": config.key},
            {"$set": {"value": config.value, "description": config.description}},
            return_document=True
        )
        return SystemConfig(**updated)
    else:
        new_config = SystemConfig(**config.model_dump())
        result = await db.system_configs.insert_one(new_config.model_dump(by_alias=True))
        new_config.id = result.inserted_id
        return new_config
