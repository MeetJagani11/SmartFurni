from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from models.user import User
from auth.auth_middleware import get_current_user
from database import get_database

from models.room_layout import RoomLayout, RoomLayoutCreate
from datetime import datetime

router = APIRouter()
db = get_database()

@router.post("/layouts", response_model=RoomLayout)
async def save_room_layout(
    layout_data: RoomLayoutCreate,
    current_user: User = Depends(get_current_user)
):
    """Save a new room layout for the user."""
    print(f"\n--- Creating New Layout: {layout_data.name} for User: {current_user.email} ---")
    layout_dict = layout_data.model_dump()
    layout_dict["user_id"] = str(current_user.id)
    layout_dict["created_at"] = datetime.utcnow()
    layout_dict["updated_at"] = datetime.utcnow()
    
    # Optional: check if name is already taken to avoid confusion
    existing = await db.room_layouts.find_one({
        "user_id": str(current_user.id),
        "name": layout_data.name
    })
    
    if existing:
        print(f"Product with name '{layout_data.name}' already exists, updating it instead.")
        # Re-use existing ID if it's the exact same name to prevent accidental duplicates 
        # but the frontend should ideally use PUT for specific updates.
        updated = await db.room_layouts.find_one_and_update(
            {"_id": existing["_id"]},
            {"$set": layout_dict},
            return_document=True
        )
        updated["_id"] = str(updated["_id"])
        return RoomLayout(**updated)

    result = await db.room_layouts.insert_one(layout_dict)
    layout_dict["_id"] = str(result.inserted_id)
    print(f"Created layout with ID: {layout_dict['_id']}")
    return RoomLayout(**layout_dict)

@router.put("/layouts/{layout_id}", response_model=RoomLayout)
async def update_room_layout(
    layout_id: str,
    layout_data: RoomLayoutCreate,
    current_user: User = Depends(get_current_user)
):
    """Update an existing room layout by ID."""
    print(f"\n--- Updating Layout ID: {layout_id} for User: {current_user.email} ---")
    from bson import ObjectId
    try:
        oid = ObjectId(layout_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid layout ID")
    
    # Verify ownership
    existing = await db.room_layouts.find_one({"_id": oid, "user_id": str(current_user.id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Layout not found or access denied")
        
    layout_dict = layout_data.model_dump()
    layout_dict["updated_at"] = datetime.utcnow()
    
    updated = await db.room_layouts.find_one_and_update(
        {"_id": oid},
        {"$set": layout_dict},
        return_document=True
    )
    
    updated["_id"] = str(updated["_id"])
    print("Update successful")
    return RoomLayout(**updated)

@router.get("/layouts", response_model=List[RoomLayout])
async def get_room_layouts(current_user: User = Depends(get_current_user)):
    """Get all saved layouts for the user."""
    cursor = db.room_layouts.find({"user_id": current_user.id})
    layouts = await cursor.to_list(100)
    # Convert _id to string for the model
    for layout in layouts:
        layout["_id"] = str(layout["_id"])
    return [RoomLayout(**l) for l in layouts]

@router.get("/layouts/{layout_id}", response_model=RoomLayout)
async def get_room_layout(layout_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific layout by ID."""
    from bson import ObjectId
    try:
        oid = ObjectId(layout_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid layout ID")
        
    layout = await db.room_layouts.find_one({"_id": oid, "user_id": current_user.id})
    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")
    
    layout["_id"] = str(layout["_id"])
    return RoomLayout(**layout)

@router.delete("/layouts/{layout_id}")
async def delete_room_layout(layout_id: str, current_user: User = Depends(get_current_user)):
    """Delete a specific layout by ID."""
    from bson import ObjectId
    try:
        oid = ObjectId(layout_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid layout ID")
        
    result = await db.room_layouts.delete_one({"_id": oid, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Layout not found")
        
    return {"message": "Layout deleted successfully"}

# Mock Dimension extractors - in a real app, products would have dimensions in the DB
def extract_dimensions(product: dict, default_l=2.0, default_w=1.0, default_h=0.8) -> tuple:
    """
    Extracts L, W, H from product data. 
    Priority: Explicit fields > mock defaults.
    """
    l = product.get("length")
    w = product.get("width")
    h = product.get("height")
    
    if l and w and h:
        return float(l), float(w), float(h)
        
    # Fallback to category-based mocks if fields are missing
    cat = product.get("category", "").lower()
    if "sofa" in cat or "recliner" in cat:
         return 2.5, 1.2, 0.9
    if "bed" in cat:
         return 2.2, 2.0, 0.6
    if "table" in cat:
         return 1.5, 1.0, 0.75
         
    return float(l or default_l), float(w or default_w), float(h or default_h)

class PlacedItem(BaseModel):
    product_id: str
    x: float # Position X
    y: float # Position Y
    rotation: float = 0.0 # 0, 90, 180, 270

class ValidationRequest(BaseModel):
    room_length: float
    room_width: float
    items: List[PlacedItem]

class ValidationResponse(BaseModel):
    is_valid: bool
    overlapping_items: List[dict] = [] # pairs of overlapping items
    out_of_bounds_items: List[str] = [] # products outside the room
    message: str

def get_bounding_box(x: float, y: float, w: float, h: float, rotation: float):
    # Returns min_x, max_x, min_y, max_y
    if rotation % 180 == 90:
        # Swap width and height for 90/270 degree rotation
        w, h = h, w
    return x, x + w, y, y + h

def check_overlap(box1, box2):
    b1_min_x, b1_max_x, b1_min_y, b1_max_y = box1
    b2_min_x, b2_max_x, b2_min_y, b2_max_y = box2
    
    # Standard AABB collision
    if b1_max_x <= b2_min_x or b2_max_x <= b1_min_x:
        return False
    if b1_max_y <= b2_min_y or b2_max_y <= b1_min_y:
        return False
    return True

@router.post("/validate", response_model=ValidationResponse)
async def validate_layout(
    req: ValidationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Validates if a collection of furniture items fits within the room dimensions
    (Length, Width, and Height) and identifies overlaps.
    """
    # Fetch room height from user preferences for additional validation
    room_pref = await db.room_preferences.find_one({"user_id": current_user.id})
    room_height = room_pref.get("height", 3.0) if room_pref else 3.0

    # 1. Fetch product dimensions from DB
    product_ids = [item.product_id for item in req.items]
    products_cursor = db.products.find({"id": {"$in": product_ids}})
    products = await products_cursor.to_list(100)
    
    # Map them for easy lookup
    product_map = {p["id"]: p for p in products}

    out_of_bounds = []
    overlapping = []
    too_tall = []
    
    # Build list of boxes: (item_index, b1_min_x, b1_max_x, b1_min_y, b1_max_y)
    boxes = []
    
    for idx, item in enumerate(req.items):
        prod = product_map.get(item.product_id)
        if not prod:
             raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
             
        l, w, h = extract_dimensions(prod)
        box = get_bounding_box(item.x, item.y, w, l, item.rotation)
        boxes.append((item.product_id, box))
        
        # Check out of bounds (Floor area)
        min_x, max_x, min_y, max_y = box
        if min_x < 0 or min_y < 0 or max_x > req.room_length or max_y > req.room_width:
            out_of_bounds.append(item.product_id)
            
        # Check height-wise fit
        if h > room_height:
            too_tall.append(item.product_id)
            
    # Check pairwise overlapping
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            id1, box1 = boxes[i]
            id2, box2 = boxes[j]
            if check_overlap(box1, box2):
                  overlapping.append({"item1": id1, "item2": id2})
                  
    is_valid = len(out_of_bounds) == 0 and len(overlapping) == 0 and len(too_tall) == 0
    
    msg_parts = []
    if out_of_bounds: msg_parts.append(f"{len(out_of_bounds)} items out of room bounds.")
    if overlapping: msg_parts.append(f"{len(overlapping)} items overlapping.")
    if too_tall: msg_parts.append(f"{len(too_tall)} items too tall for the room.")
    
    msg = "Layout is perfectly valid!" if is_valid else " ".join(msg_parts)
    
    return ValidationResponse(
        is_valid=is_valid,
        overlapping_items=overlapping,
        out_of_bounds_items=out_of_bounds,
        message=msg
    )

class SuggestionRequest(BaseModel):
    room_length: float
    room_width: float
    product_ids: List[str]

class LayoutSuggestion(BaseModel):
    product_id: str
    x: float
    y: float
    rotation: float

@router.post("/suggest-layout", response_model=List[LayoutSuggestion])
async def suggest_layout(
    req: SuggestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Very basic heuristic layout suggestor. Drops items sequentially in rows.
    In a real AI engine, this would use genetic algorithms or physics-based bin packing.
    """
    products_cursor = db.products.find({"id": {"$in": req.product_ids}})
    products = await products_cursor.to_list(100)
    product_map = {p["id"]: p for p in products}
    
    layout = []
    current_x = 0.5 # start with some padding
    current_y = 0.5
    row_height = 0.0
    
    for p_id in req.product_ids:
        prod = product_map.get(p_id)
        if not prod: continue
        
        l, w = extract_dimensions(prod)
        
        # If item goes beyond width, wrap to new row
        if current_x + w > req.room_length:
             current_x = 0.5
             current_y += row_height + 0.5
             row_height = 0.0
             
        # Record placement
        layout.append(LayoutSuggestion(
            product_id=p_id,
            x=current_x,
            y=current_y,
            rotation=0.0
        ))
        
        # Update trackers
        current_x += w + 0.5 # 0.5m spacing between items
        row_height = max(row_height, l)
        
    return layout
