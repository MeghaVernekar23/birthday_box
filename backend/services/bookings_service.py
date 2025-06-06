from sqlalchemy.orm import Session, aliased
from datetime import date
from db.models.sqlalchemy_models import Booking, Customer, Packages, Users, CelebrationType
from db.models.booking_pydantic_model import BookingDetails, EditBookingDetails, AddBookingDetails
from utils.exceptions import BookingDetailsNotFoundException, InvalidFilterException
from fastapi import HTTPException
from datetime import datetime, timezone
from utils.db_utils import get_active_celebration_types, get_active_packages, get_booking_query, get_customer_by_phone, get_user_by_username
from typing import List


def get_celebration_type(db: Session) -> List[CelebrationType]:
    """
    Retrieve all active celebration types from the database.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[CelebrationType]: A list of active celebration types.
    """
    try:
        return get_active_celebration_types(db)
    except Exception as e:
        raise Exception(f"An error occurred while fetching celebration types: {e}")
    

def get_package(db: Session) -> List[Packages]:
    """
    Fetch active packages using the utility function.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[Packages]: A list of active packages.
    """
    try:
        return get_active_packages(db)
    except Exception as e:
        raise Exception(f"An error occurred while fetching package details: {e}")    


def get_bookings_details(filter: str, db: Session) -> List[BookingDetails]:
    """
    Fetch booking details based on filter (today, future, past, all).

    Args:
        filter (str): Filter type (today, future, past, all).
        db (Session): SQLAlchemy database session.

    Returns:
        List[Any]: List of booking details.

    Raises:
        InvalidFilterException: If the filter value is invalid.
    """
    try:
        query = get_booking_query(db)
        today = date.today()

        filter_map = {
            "today": Booking.event_date == today,
            "future": Booking.event_date > today,
            "past": Booking.event_date < today,
            "all": Booking.event_date >= today,
        }

        filter_condition = filter_map.get(filter.lower())
        if filter_condition is None:
            raise InvalidFilterException(filter_value=filter, allowed_filters=list(filter_map.keys()))

        query = query.filter(filter_condition)

        return query.order_by(Booking.event_date).all()

    except InvalidFilterException:
        raise
    except Exception as e:
        raise Exception(f"An error occurred while fetching booking details: {e}")



def get_booking_details_by_id(booking_id: int, db: Session)-> BookingDetails:
    """
    Fetch booking details by booking ID.

    Args:
        booking_id (int): ID of the booking.
        db (Session): SQLAlchemy database session.

    Returns:
        Any: Booking details.

    Raises:
        BookingDetailsNotFoundException: If the booking ID does not exist.
    """
    try:
        query = get_booking_query(db)
        result = query.filter(Booking.booking_id == booking_id).first()

        if not result:
            raise BookingDetailsNotFoundException(f"No booking found with ID: {booking_id}")

        return result

    except BookingDetailsNotFoundException:
        raise
    except Exception as e:
        raise Exception(f"An error occurred while fetching booking details: {e}")


def add_booking_details(bookingDetails: AddBookingDetails, db: Session)-> dict:
    """
    Create a new booking for a customer. If the customer doesn't exist, create a new customer.
    
    Args:
        bookingDetails (AddBookingDetails): Booking information.
        db (Session): SQLAlchemy DB session.

    Returns:
        dict: Success message and booking ID.
    """
    try:
        
        customer = get_customer_by_phone(bookingDetails.phone_number, db)
        if not customer:
            customer = Customer(
                name=bookingDetails.customer_name,
                phone_number=bookingDetails.phone_number,
                email=bookingDetails.email,
                address=bookingDetails.address
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)

        user = get_user_by_username(bookingDetails.created_by, db)

        booking = Booking(
            customer_id=customer.customer_id,
            package_id=bookingDetails.package_id,
            celebration_id=bookingDetails.celebration_id,
            event_date=bookingDetails.event_date,
            event_time=bookingDetails.time_slot,
            status=bookingDetails.status,
            notes=bookingDetails.addons_note,
            created_by=user.id,
            created_at=datetime.now(timezone.utc)
        )

        db.add(booking)
        db.commit()
        db.refresh(booking)

        return {
            "message": "Booking created successfully",
            "booking_id": booking.booking_id,
            "customer_id": customer.customer_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


def delete_booking_detail(booking_id: int, db: Session) -> dict:
    """
    Delete a booking by ID. Raises a 404 error if the booking is not found.

    Args:
        booking_id (int): The ID of the booking to delete.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Success message on deletion.
    """
    try:
        booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()

        if not booking:
            raise BookingDetailsNotFoundException(f"No booking found with ID: {booking_id}")

        db.delete(booking)
        db.commit()

        return {"message": "Booking deleted successfully"}

    except BookingDetailsNotFoundException:
        raise HTTPException(status_code=404, detail="Booking not found.")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    

def update_booking_detail(booking_id: int, booking_details: EditBookingDetails, db: Session) -> dict:
    """
    Update an existing booking and its associated customer details.

    Args:
        booking_id (int): ID of the booking to update.
        booking_details (EditBookingDetails): New booking details.
        db (Session): SQLAlchemy DB session.

    Returns:
        dict: Success message.
    """
    try:
        booking = db.get(Booking, booking_id)
        if not booking:
            raise BookingDetailsNotFoundException(f"Booking with ID {booking_id} not found.")

        user = get_user_by_username(booking_details.updated_by, db)

        booking.package_id = booking_details.package_id
        booking.celebration_id = booking_details.celebration_id
        booking.event_date = booking_details.event_date
        booking.event_time = booking_details.time_slot
        booking.notes = booking_details.addons_note
        booking.status = booking_details.status
        booking.updated_at = datetime.now(timezone.utc)
        booking.updated_by = user.id

        try:
            customer = get_customer_by_phone(booking_details.phone_number, db)
            customer.name = booking_details.customer_name
            customer.email = booking_details.email
            customer.address = booking_details.address
        except HTTPException:
            pass

        
        db.commit()
        return {
            "message": "Booking created successfully",
            "booking_id": booking.booking_id
        }

    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating booking: {str(e)}")
    