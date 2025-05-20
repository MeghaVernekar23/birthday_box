
from fastapi import APIRouter, Depends, HTTPException, Query
from db.sessions import create_tables
from db.models.pydantic_models import BookingDetails, CelebrationDetails, PackageDetails, AddBookingDetails, EditBookingDetails
from sqlalchemy.orm import Session
from db.sessions import get_db
from datetime import date
from utils.exceptions import BookingDetailsNotFoundException
from services.bookings_service import get_bookings_details, get_celebration_type, get_package, add_booking_details, delete_booking_detail, get_booking_details_by_id, update_booking_detail
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
    
@bookings_router.get("/bookings/{booking_id}", response_model=EditBookingDetails, dependencies=[Depends(get_current_user)])
def get_bookings_by_id(booking_id : int ,db: Session = Depends(get_db)):
    try:
        return get_booking_details_by_id(booking_id= booking_id, db= db)
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
    

@bookings_router.delete("/deleteBooking/{booking_id}", dependencies=[Depends(get_current_user)])
async def delete_booking(booking_id: int,db: Session = Depends(get_db)):
    try:
        return delete_booking_detail(booking_id= booking_id,db= db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))    
    


@bookings_router.put("/updateBooking/{booking_id}", dependencies=[Depends(get_current_user)])
async def update_booking(booking_id: int,booking_details: EditBookingDetails, db: Session = Depends(get_db)):
    try:
        return update_booking_detail(booking_id= booking_id, booking_details=booking_details, db= db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))   