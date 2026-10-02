from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from models.product import Product, ProductCreate, ProductUpdate
from auth.auth_middleware import get_current_admin_user
from models.user import User
from database import get_database
from datetime import datetime

router = APIRouter()
db = get_database()

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Create a new product (Admin only)
    """
    try:
        new_product = Product(**product.model_dump(by_alias=True))
        await db.products.insert_one(new_product.model_dump(by_alias=True))
        return new_product
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

@router.get("/", response_model=List[Product])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get all products (Admin only)
    """
    try:
        cursor = db.products.find().skip(skip).limit(limit)
        products_raw = await cursor.to_list(length=limit)
        
        results = []
        for p in products_raw:
            # Ensure an 'id' field exists for the frontend
            if "id" not in p and "_id" in p:
                p["id"] = str(p["_id"])
            elif "_id" in p:
                # Keep _id for internal use but Pydantic handles id
                pass
            results.append(Product(**p))
        return results
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update a product (Admin only)
    """
    try:
        update_data = {k: v for k, v in product_update.model_dump(by_alias=True, exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")
            
        update_data["updated_at"] = datetime.utcnow()
        
        # Try finding by 'id' field first, then by MongoDB '_id'
        result = await db.products.find_one_and_update(
            {"id": product_id},
            {"$set": update_data},
            return_document=True
        )
        
        if not result:
            from bson import ObjectId
            try:
                result = await db.products.find_one_and_update(
                    {"_id": ObjectId(product_id)},
                    {"$set": update_data},
                    return_document=True
                )
            except:
                pass
        
        if not result:
            raise HTTPException(status_code=404, detail="Product not found")
            
        return Product(**result)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete a product (Admin only)
    """
    try:
        # Try deleting by 'id' field first
        result = await db.products.delete_one({"id": product_id})
        
        if result.deleted_count == 0:
            # Fallback to MongoDB '_id'
            from bson import ObjectId
            try:
                result = await db.products.delete_one({"_id": ObjectId(product_id)})
            except:
                pass
                
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")
