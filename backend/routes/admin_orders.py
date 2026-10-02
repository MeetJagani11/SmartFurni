from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from models.order import Order
from auth.auth_middleware import get_current_admin_user
from models.user import User
from database import get_database

router = APIRouter()
db = get_database()

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/", response_model=List[Order])
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get all orders (Admin only), optionally filter by status
    """
    try:
        query = {}
        if status:
            query["status"] = status
            
        cursor = db.orders.find(query).skip(skip).limit(limit)
        orders = await cursor.to_list(length=limit)
        return [Order(**o) for o in orders]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get specific order details (Admin only)
    """
    try:
        order = await db.orders.find_one({"id": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return Order(**order)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")

@router.patch("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update an order's status (Admin only)
    """
    try:
        valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        if status_update.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
            
        # Determine if order is completed
        update_data = {"status": status_update.status}
        if status_update.status in ["delivered", "cancelled"]:
            update_data["completedAt"] = datetime.utcnow()
        else:
            update_data["completedAt"] = None

        result = await db.orders.find_one_and_update(
            {"id": order_id},
            {
                "$set": update_data,
                "$push": {
                    "trackingHistory": {
                        "status": status_update.status,
                        "timestamp": datetime.utcnow(),
                        "note": f"Order status updated to {status_update.status}"
                    }
                }
            },
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Order not found")
            
        return Order(**result)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update order status: {str(e)}")

@router.delete("/{order_id}")
async def delete_order(
    order_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete an order (Admin only)
    """
    try:
        result = await db.orders.delete_one({"id": order_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        return {"message": "Order deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete order: {str(e)}")
