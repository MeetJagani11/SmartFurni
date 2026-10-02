from fastapi import APIRouter, HTTPException
from typing import List
from models.booking import Booking, BookingCreate
from database import get_database

router = APIRouter(prefix="/bookings", tags=["bookings"])
db = get_database()

@router.post("/", response_model=Booking)
async def create_booking(booking: BookingCreate):
    """
    Create a new store visit booking
    """
    booking_obj = Booking(**booking.dict())
    await db.bookings.insert_one(booking_obj.dict())
    return booking_obj

@router.get("/", response_model=List[Booking])
async def get_bookings(skip: int = 0, limit: int = 100):
    """
    Get all bookings (admin endpoint)
    """
    bookings = await db.bookings.find().skip(skip).limit(limit).to_list(limit)
    return [Booking(**booking) for booking in bookings]

@router.get("/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    """
    Get a single booking by ID
    """
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return Booking(**booking)
