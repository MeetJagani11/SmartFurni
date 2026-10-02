from fastapi import APIRouter, HTTPException
from typing import List
from models.category import Category, CategoryCreate
from database import get_database

router = APIRouter(prefix="/categories", tags=["categories"])
db = get_database()

@router.get("/", response_model=List[Category])
async def get_categories():
    """
    Get all categories
    """
    categories = await db.categories.find({"active": True}).sort("order", 1).to_list(100)
    return [Category(**category) for category in categories]

@router.get("/{category_id}", response_model=Category)
async def get_category(category_id: str):
    """
    Get a single category by ID
    """
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return Category(**category)

@router.post("/", response_model=Category)
async def create_category(category: CategoryCreate):
    """
    Create a new category
    """
    category_obj = Category(**category.dict())
    await db.categories.insert_one(category_obj.dict())
    return category_obj
