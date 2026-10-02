from fastapi import APIRouter, HTTPException, Depends
from models.compare import Compare
from models.user import User
from auth.auth_middleware import get_current_user
from database import get_database

router = APIRouter()
db = get_database()

@router.get("/", response_model=Compare)
async def get_compare_list(current_user: User = Depends(get_current_user)):
    """Get the current user's comparison list."""
    compare = await db.compares.find_one({"user_id": current_user.id})
    if not compare:
        new_compare = Compare(user_id=current_user.id)
        result = await db.compares.insert_one(new_compare.model_dump(by_alias=True))
        new_compare.id = result.inserted_id
        return new_compare
    return Compare(**compare)

@router.post("/add/{product_id}", response_model=Compare)
async def add_to_compare(product_id: str, current_user: User = Depends(get_current_user)):
    """Add a product to comparison. Max 4 items typically allowed on frontend."""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    compare = await db.compares.find_one({"user_id": current_user.id})
    
    if not compare:
        new_compare = Compare(user_id=current_user.id, product_ids=[product_id])
        result = await db.compares.insert_one(new_compare.model_dump(by_alias=True))
        new_compare.id = result.inserted_id
        return new_compare
    
    if len(compare.get("product_ids", [])) >= 4:
         raise HTTPException(status_code=400, detail="Maximum 4 items allowed in compare list")
         
    if product_id not in compare.get("product_ids", []):
        result = await db.compares.find_one_and_update(
            {"user_id": current_user.id},
            {"$push": {"product_ids": product_id}},
            return_document=True
        )
        return Compare(**result)
        
    return Compare(**compare)

@router.delete("/remove/{product_id}", response_model=Compare)
async def remove_from_compare(product_id: str, current_user: User = Depends(get_current_user)):
    """Remove a product from comparison."""
    result = await db.compares.find_one_and_update(
        {"user_id": current_user.id},
        {"$pull": {"product_ids": product_id}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Compare list not found")
    return Compare(**result)
