from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models.cart import Cart, CartItem, CartItemAdd, CartItemUpdate
from models.product import Product
from database import get_database
import uuid

router = APIRouter(prefix="/cart", tags=["cart"])
db = get_database()

@router.get("/", response_model=Cart)
async def get_cart(session_id: Optional[str] = Header(None)):
    """
    Get cart for session
    """
    if not session_id:
        session_id = str(uuid.uuid4())
    
    cart = await db.carts.find_one({"session_id": session_id})
    
    if not cart:
        cart = Cart(session_id=session_id)
        await db.carts.insert_one(cart.dict())
    
    return Cart(**cart)

@router.post("/items", response_model=Cart)
async def add_to_cart(
    item: CartItemAdd,
    session_id: Optional[str] = Header(None)
):
    """
    Add item to cart
    """
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Get product details
    product = await db.products.find_one({"id": item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_obj = Product(**product)
    
    # Get or create cart
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        cart = Cart(session_id=session_id)
    else:
        cart = Cart(**cart)
    
    # Check if item already exists in cart
    existing_item = None
    for i, cart_item in enumerate(cart.items):
        if cart_item.product_id == item.product_id:
            existing_item = i
            break
    
    if existing_item is not None:
        # Update quantity
        cart.items[existing_item].quantity += item.quantity
    else:
        # Add new item
        cart_item = CartItem(
            product_id=product_obj.id,
            product_name=product_obj.name,
            product_image=product_obj.image,
            price=product_obj.smart_furni_price,
            quantity=item.quantity
        )
        cart.items.append(cart_item)
    
    # Calculate total
    cart.total = sum(item.price * item.quantity for item in cart.items)
    
    # Update cart in database
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": cart.dict()},
        upsert=True
    )
    
    return cart

@router.put("/items/{product_id}", response_model=Cart)
async def update_cart_item(
    product_id: str,
    update: CartItemUpdate,
    session_id: Optional[str] = Header(None)
):
    """
    Update cart item quantity
    """
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = Cart(**cart)
    
    # Find and update item
    item_found = False
    for i, item in enumerate(cart.items):
        if item.product_id == product_id:
            if update.quantity <= 0:
                cart.items.pop(i)
            else:
                cart.items[i].quantity = update.quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    # Recalculate total
    cart.total = sum(item.price * item.quantity for item in cart.items)
    
    # Update cart in database
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": cart.dict()}
    )
    
    return cart

@router.delete("/items/{product_id}", response_model=Cart)
async def remove_from_cart(
    product_id: str,
    session_id: Optional[str] = Header(None)
):
    """
    Remove item from cart
    """
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = Cart(**cart)
    
    # Remove item
    cart.items = [item for item in cart.items if item.product_id != product_id]
    
    # Recalculate total
    cart.total = sum(item.price * item.quantity for item in cart.items)
    
    # Update cart in database
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": cart.dict()}
    )
    
    return cart

@router.delete("/", response_model=dict)
async def clear_cart(session_id: Optional[str] = Header(None)):
    """
    Clear all items from cart
    """
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": {"items": [], "total": 0.0}}
    )
    
    return {"message": "Cart cleared successfully"}
