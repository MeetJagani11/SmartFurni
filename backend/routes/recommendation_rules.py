from fastapi import APIRouter, HTTPException, Depends
from models.recommendation_rule import RecommendationRule, RecommendationRuleCreate
from models.user import User
from auth.auth_middleware import get_current_admin_user
from database import get_database
from typing import List

from datetime import datetime
from bson import ObjectId

router = APIRouter()
db = get_database()

@router.get("/", response_model=List[RecommendationRule])
async def get_all_rules():
    """Get all recommendation rules. Useful for backend processing."""
    rules = await db.recommendation_rules.find().sort("priority", -1).to_list(100)
    return [RecommendationRule(**r) for r in rules]

@router.post("/", response_model=RecommendationRule, status_code=201)
async def create_rule(
    rule: RecommendationRuleCreate, 
    current_admin: User = Depends(get_current_admin_user)
):
    """Admin: Create a new recommendation rule/strategy."""
    now = datetime.utcnow()
    rule_dict = rule.model_dump()
    rule_dict["created_at"] = now
    rule_dict["updated_at"] = now
    
    result = await db.recommendation_rules.insert_one(rule_dict)
    
    # Fetch the newly created rule to return it with all fields
    new_rule_doc = await db.recommendation_rules.find_one({"_id": result.inserted_id})
    return RecommendationRule(**new_rule_doc)

@router.put("/{rule_id}", response_model=RecommendationRule)
async def update_rule(
    rule_id: str,
    rule_update: RecommendationRuleCreate,
    current_admin: User = Depends(get_current_admin_user)
):
    """Admin: Update an existing recommendation rule."""
    try:
        obj_id = ObjectId(rule_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Rule ID")
        
    update_data = rule_update.model_dump()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.recommendation_rules.find_one_and_update(
        {"_id": obj_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    return RecommendationRule(**result)


@router.delete("/{rule_id}", status_code=204)
async def delete_rule(rule_id: str, current_admin: User = Depends(get_current_admin_user)):
    """Admin: Delete a recommendation rule."""
    try:
        obj_id = ObjectId(rule_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Rule ID")
        
    result = await db.recommendation_rules.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
         raise HTTPException(status_code=404, detail="Rule not found")
