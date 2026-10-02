from fastapi import APIRouter, HTTPException, Depends
from models.wishlist import Wishlist, WishlistCreate
from models.user import User
from auth.auth_middleware import get_current_user
from fastapi import BackgroundTasks
from routes.activity_logs import log_activity_bg
from models.activity_log import ActivityLog
from database import get_database

router = APIRouter()
db = get_database()

@router.get("/", response_model=Wishlist)
async def get_wishlist(current_user: User = Depends(get_current_user)):
    """Get the current user's wishlist."""
    wishlist = await db.wishlists.find_one({"user_id": current_user.id})
    if not wishlist:
        # Auto-create if not exists
        new_wishlist = Wishlist(user_id=current_user.id)
        result = await db.wishlists.insert_one(new_wishlist.model_dump(by_alias=True))
        new_wishlist.id = result.inserted_id
        return new_wishlist
    return Wishlist(**wishlist)

@router.post("/add/{product_id}", response_model=Wishlist)
async def add_to_wishlist(
    product_id: str, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Add a product to the user's wishlist."""
    # Check if product exists
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Log wishlist activity
    log_entry = ActivityLog(
        action="add_to_wishlist",
        user_id=current_user.id,
        entity_id=product_id
    )
    background_tasks.add_task(log_activity_bg, log_entry.model_dump(by_alias=True))

    wishlist = await db.wishlists.find_one({"user_id": current_user.id})
    
    if not wishlist:
        new_wishlist = Wishlist(user_id=current_user.id, product_ids=[product_id])
        result = await db.wishlists.insert_one(new_wishlist.model_dump(by_alias=True))
        new_wishlist.id = result.inserted_id
        return new_wishlist
    
    if product_id not in wishlist.get("product_ids", []):
        result = await db.wishlists.find_one_and_update(
            {"user_id": current_user.id},
            {"$push": {"product_ids": product_id}},
            return_document=True
        )
        return Wishlist(**result)
    
    return Wishlist(**wishlist)

@router.delete("/remove/{product_id}", response_model=Wishlist)
async def remove_from_wishlist(product_id: str, current_user: User = Depends(get_current_user)):
    """Remove a product from the user's wishlist."""
    result = await db.wishlists.find_one_and_update(
        {"user_id": current_user.id},
        {"$pull": {"product_ids": product_id}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    return Wishlist(**result)
