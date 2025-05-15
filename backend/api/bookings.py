
from fastapi import APIRouter, Depends, HTTPException, Query
from db.sessions import create_tables
from db.models.pydantic_models import BookingDetails, CelebrationDetails, PackageDetails, AddBookingDetails
from sqlalchemy.orm import Session
from db.sessions import get_db
from datetime import date
from utils.exceptions import BookingDetailsNotFoundException
from services.bookings_service import get_bookings_details, get_celebration_type, get_package, add_booking_details
from services.oauth import get_current_user

bookings_router = APIRouter()

create_tables()

@bookings_router.get("/bookings/by-filter", response_model=list[BookingDetails], dependencies=[Depends(get_current_user)])
def get_bookings(filter: str = Query(..., description="Filter to fetch booking details"),db: Session = Depends(get_db)):
    try:
        return get_bookings_details(filter = filter, db= db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  


@bookings_router.get("/celebration-type", response_model=list[CelebrationDetails], dependencies=[Depends(get_current_user)])
def get_celebtation_type_details(db: Session = Depends(get_db)):
    try:
        return get_celebration_type(db =db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  

@bookings_router.get("/package", response_model=list[PackageDetails], dependencies=[Depends(get_current_user)])
def get_package_details(db: Session = Depends(get_db)):
    try:
        return get_package(db= db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
    

@bookings_router.post("/submitBookings", dependencies=[Depends(get_current_user)])  
def submit_booking_details(bookingDetails: AddBookingDetails, db: Session = Depends(get_db)):
    print("***booking details***",bookingDetails)
    try:
        return add_booking_details(bookingDetails= bookingDetails, db= db )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  