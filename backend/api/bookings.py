from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from db.models.booking_pydantic_model import (
    BookingDetails,
    CelebrationDetails,
    PackageDetails,
    AddBookingDetails,
    EditBookingDetails,
    CustomerBookingSummary
)
from db.sessions import get_db
from services.bookings_service import (
    get_bookings_details,
    get_celebration_type,
    get_package,
    add_booking_details,
    delete_booking_detail,
    get_booking_details_by_id,
    update_booking_detail,
    get_booking_summary_by_customer_id,
    get_bookings_by_date,
    get_next_upcoming_booking,
    update_payment_detail
)
from services.oauth import get_current_user
from utils.exceptions import BookingDetailsNotFoundException, InvalidFilterException


bookings_router = APIRouter(
    prefix="/bookings",
    tags=["Booking"],
    responses={404: {"description": "Not Found"}},
)


@bookings_router.get(
    "/celebration-type",
    response_model=List[CelebrationDetails],
    description="Get all available celebration types.",
)
def get_celebration_type_details(db: Session = Depends(get_db)) -> List[CelebrationDetails]:
    """
    Retrieve all available celebration types.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[CelebrationDetails]: Celebration types.
    """
    try:
        return get_celebration_type(db=db)
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@bookings_router.get(
    "/package",
    response_model=List[PackageDetails],
    description="Get all available packages.",
)
def get_package_details(db: Session = Depends(get_db)) -> List[PackageDetails]:
    """
    Retrieve all available packages.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[PackageDetails]: Package details.
    """
    try:
        return get_package(db=db)
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
    


@bookings_router.get(
    "/by-filter",
    response_model=List[BookingDetails],
    dependencies=[Depends(get_current_user)],
    description="Fetch bookings based on a filter (e.g., status, date).",
)
def get_bookings(
    filter: str = Query(..., description="Filter to fetch booking details"),
    db: Session = Depends(get_db),
) -> List[BookingDetails]:
    """
    Retrieve bookings matching a specific filter.

    Args:
        filter (str): Filter criteria (e.g., status, date).
        db (Session): SQLAlchemy database session.

    Returns:
        List[BookingDetails]: List of bookings matching the filter.
    """
    try:
        return get_bookings_details(filter=filter, db=db)
    except InvalidFilterException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
    

@bookings_router.get(
    "/by-date",
    response_model=List[BookingDetails],
    dependencies=[Depends(get_current_user)],
    description="Fetch bookings based on a filter (e.g., status, date).",
)
def get_bookings_details_by_date(
    date: str = Query(..., description="date to fetch booking details"),
    db: Session = Depends(get_db),
) -> List[BookingDetails]:
    """
    Retrieve bookings matching a specific filter.

    Args:
        filter (str): Filter criteria (e.g., status, date).
        db (Session): SQLAlchemy database session.

    Returns:
        List[BookingDetails]: List of bookings matching the filter.
    """
    try:
        return get_bookings_by_date(date=date, db=db)
    except InvalidFilterException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")    
    

@bookings_router.get(
    "/next-booking",
    response_model=BookingDetails,
    dependencies=[Depends(get_current_user)],
    description="Fetch the next upcoming booking for today.",
)
def get_next_booking(
    db: Session = Depends(get_db),
) -> BookingDetails:
    """
    Retrieve the next upcoming booking for today.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        BookingDetails: Next upcoming booking today.
    """
    try:
        return get_next_upcoming_booking(db=db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail=str(e))    


@bookings_router.get(
    "/{booking_id}",
    response_model=BookingDetails,
    dependencies=[Depends(get_current_user)],
    description="Fetch booking details by ID.",
)
def get_booking_by_id(
    booking_id: int,
    db: Session = Depends(get_db),
) -> BookingDetails:
    """
    Retrieve booking details by ID.

    Args:
        booking_id (int): ID of the booking.
        db (Session): SQLAlchemy database session.

    Returns:
        EditBookingDetails: Booking details.
    """
    try:
        return get_booking_details_by_id(booking_id=booking_id, db=db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")




@bookings_router.post(
    "/submit",
    response_model=dict,
    dependencies=[Depends(get_current_user)],
    description="Submit a new booking.",
)
def submit_booking_details(
    booking_details: AddBookingDetails,
    db: Session = Depends(get_db),
) -> dict:
    """
    Submit a new booking.

    Args:
        booking_details (AddBookingDetails): Details of the booking to add.
        db (Session): SQLAlchemy database session.

    Returns:
        str: Confirmation message.
    """
    try:
        return add_booking_details(bookingDetails=booking_details, db=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail={str(e)})


@bookings_router.delete(
    "/delete/{booking_id}",
    response_model=dict,
    dependencies=[Depends(get_current_user)],
    description="Delete a booking by ID.",
)
async def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
) -> dict:
    """
    Delete a booking by ID.

    Args:
        booking_id (int): ID of the booking to delete.
        db (Session): SQLAlchemy database session.

    Returns:
        str: Confirmation message.
    """
    try:
        return delete_booking_detail(booking_id=booking_id, db=db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@bookings_router.put(
    "/update/{booking_id}",
    response_model=dict,
    dependencies=[Depends(get_current_user)],
    description="Update a booking by ID.",
)
async def update_booking(
    booking_id: int,
    booking_details: EditBookingDetails,
    db: Session = Depends(get_db),
) -> dict:
    """
    Update an existing booking by ID.

    Args:
        booking_id (int): ID of the booking to update.
        booking_details (EditBookingDetails): Updated booking details.
        db (Session): SQLAlchemy database session.

    Returns:
        str: Confirmation message.
    """
    try:
        return update_booking_detail(booking_id=booking_id, booking_details=booking_details, db=db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@bookings_router.put(
    "/update-payment/{booking_id}",
    response_model=dict,
    dependencies=[Depends(get_current_user)],
    description="Update a payment by booking ID.",
)
async def update_payment(
    booking_id: int,
    booking_details: EditBookingDetails,
    db: Session = Depends(get_db),
) -> dict:
    """
    Update payment details for existing booking by ID.

    Args:
        booking_id (int): ID of the booking to update.
        booking_details (EditBookingDetails): Updated payment details.
        db (Session): SQLAlchemy database session.

    Returns:
        str: Confirmation message.
    """
    try:
        return update_payment_detail(booking_id=booking_id, booking_details=booking_details, db=db)
    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    


@bookings_router.get(
    "/by-customer-id/{customer_id}",
    response_model=List[CustomerBookingSummary],
    dependencies=[Depends(get_current_user)],
    description="Fetch all bookings for a given customer ID."
)
def get_bookings_by_customer(
    customer_id: int,
    db: Session = Depends(get_db)
) -> List[CustomerBookingSummary]:
    """
    Retrieve all booking records associated with a specific customer ID.

    Args:
        customer_id (int): The unique identifier of the customer.
        db (Session): SQLAlchemy session to interact with the database.

    Returns:
        List[CustomerBookingSummary]: A list of bookings related to the provided customer.

    Raises:
        HTTPException: 
            - 500 if there is an internal server error or DB access failure.
    """
    try:
        return get_booking_summary_by_customer_id(customer_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


