from fastapi import APIRouter, HTTPException, Depends
from models.order import Order, OrderCreate
from models.user import User
from auth.auth_middleware import get_current_user
from database import get_database
from typing import List
from datetime import datetime

router = APIRouter()
db = get_database()

@router.post("/", response_model=Order, status_code=201)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        new_order = Order(**order_data.model_dump(by_alias=True))
        new_order.user_id = current_user.id
        
        # Initialize tracking history
        new_order.tracking_history = [
            {"status": "pending", "timestamp": datetime.utcnow(), "note": "Order placed successfully"}
        ]
        
        # Save to database
        await db.orders.insert_one(new_order.model_dump(by_alias=True))
        
        return new_order
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.get("/", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    try:
        orders = await db.orders.find({"userId": current_user.id}).to_list(1000)
        return [Order(**order) for order in orders]
    except Exception as e:
         print(f"Error fetching orders: {str(e)}")
         raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@router.post("/{order_id}/return", response_model=Order)
async def request_order_return(
    order_id: str,
    reason: str,
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG: Return request for order {order_id} by user {current_user.email}")
    print(f"DEBUG: Reason: {reason}")
    try:
        # Find order
        # If user is admin, they can return any order
        if current_user.is_admin or current_user.email == 'meetjagani1107@gmail.com':
            order_doc = await db.orders.find_one({"id": order_id})
        else:
            order_doc = await db.orders.find_one({"id": order_id, "userId": current_user.id})
            
        print(f"DEBUG RETURN: order_id={order_id}, userId={current_user.id}, found={order_doc is not None}")
        if not order_doc:

            print(f"DEBUG: Order {order_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Order not found")
        
        order = Order(**order_doc)
        print(f"DEBUG: Found order status: {order.status}")
        
        # Check if already returned or status is appropriate
        if order.status != "delivered":
            print(f"DEBUG: Invalid status for return: {order.status}")
            raise HTTPException(status_code=400, detail="Only delivered orders can be returned")
        
        # Check if within 7 days of delivery (completed_at)
        delivery_date = order.completed_at or order.created_at
        days_since_delivery = (datetime.utcnow() - delivery_date).days
        print(f"DEBUG: Days since delivery: {days_since_delivery}")
        
        if days_since_delivery > 7:
            print(f"DEBUG: Return period expired: {days_since_delivery} days")
            raise HTTPException(status_code=400, detail="Return period (7 days) has expired")
        
        # Update order
        return_requested_at = datetime.utcnow()
        update_data = {
            "status": "return_requested",
            "returnRequestedAt": return_requested_at,
            "returnReason": reason
        }
        
        # Add tracking history
        tracking_update = {
            "status": "return_requested",
            "timestamp": return_requested_at,
            "note": f"Return requested. Reason: {reason}"
        }
        
        print(f"DEBUG: Updating order {order_id} in DB...")
        result = await db.orders.update_one(
            {"id": order_id},
            {
                "$set": update_data,
                "$push": {"trackingHistory": tracking_update}
            }
        )
        print(f"DEBUG: Update result - matched: {result.matched_count}, modified: {result.modified_count}")
        
        # Return updated order
        updated_doc = await db.orders.find_one({"id": order_id})
        return Order(**updated_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"DEBUG: UNEXPECTED ERROR in request_order_return: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to request return: {str(e)}")

@router.post("/{order_id}/cancel", response_model=Order)
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        # Find order
        print(f"--- DEBUG CANCEL START ---")
        print(f"Order ID from URL: {order_id}")
        print(f"Current User Email: {current_user.email}")
        print(f"Current User ID: {current_user.id}")
        
        # Check if order exists at all
        order_doc_any = await db.orders.find_one({"id": order_id})
        if order_doc_any:
            print(f"Order found in DB without user filter.")
            print(f"Order's userId in DB: {order_doc_any.get('userId')}")
            print(f"IDs match? {order_doc_any.get('userId') == current_user.id}")
        else:
            print(f"Order NOT found in DB even without user filter!")

        # If user is admin, they can cancel any order
        if current_user.is_admin or current_user.email == 'meetjagani1107@gmail.com':
            order_doc = order_doc_any
        else:
            order_doc = await db.orders.find_one({"id": order_id, "userId": current_user.id})
            
        if not order_doc:
            print(f"Final result: Order not found or permission denied.")
            raise HTTPException(status_code=404, detail="Order not found")



        
        order = Order(**order_doc)
        
        # Check if status allows cancellation
        if order.status not in ["pending", "processing"]:
            raise HTTPException(status_code=400, detail=f"Order cannot be cancelled in its current status: {order.status}")
        
        # Update order
        cancelled_at = datetime.utcnow()
        update_data = {
            "status": "cancelled",
        }
        
        # Add tracking history
        tracking_update = {
            "status": "cancelled",
            "timestamp": cancelled_at,
            "note": "Order cancelled by user"
        }
        
        await db.orders.update_one(
            {"id": order_id},
            {
                "$set": update_data,
                "$push": {"trackingHistory": tracking_update}
            }
        )
        
        # Return updated order
        updated_doc = await db.orders.find_one({"id": order_id})
        return Order(**updated_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error cancelling order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel order: {str(e)}")

