from sqlalchemy.orm import Session, aliased
from datetime import date
from db.models.sqlalchemy_models import Booking, Customer, Packages, Users, CelebrationType
from db.models.booking_pydantic_model import BookingDetails, EditBookingDetails, AddBookingDetails, CustomerBookingSummary
from utils.exceptions import BookingDetailsNotFoundException, InvalidFilterException
from fastapi import HTTPException
from datetime import datetime, timezone
from utils.db_utils import get_active_celebration_types, get_active_packages, get_booking_query, get_customer_by_phone, get_user_by_username, fetch_booking_by_customer_id
from typing import List
from sqlalchemy import func
from sqlalchemy import and_
from services.telegram_service import notify_new_booking, schedule_reminders


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


def get_bookings_details(filter: str,  db: Session) -> List[BookingDetails]:
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
            "todayandfuture": Booking.event_date >= today,
            "all": None
        }

        if filter:
            normalized = filter.lower()
            filter_condition = filter_map.get(normalized)
            if normalized not in filter_map:
                raise InvalidFilterException(
            filter_value=filter,
            allowed_filters=list(filter_map.keys())
            )
            if filter_condition is not None:
                query = query.filter(filter_condition)

        return query.order_by(Booking.event_date).all()

    except InvalidFilterException:
        raise
    except Exception as e:
        raise Exception(f"An error occurred while fetching booking details: {e}")

def get_bookings_by_date(date: str,  db: Session) -> List[BookingDetails]:
    """
    Fetch booking details based on date .

    Args:
        date (str): date.
        db (Session): SQLAlchemy database session.

    Returns:
        List[Any]: List of booking details.

    Raises:
        InvalidFilterException: If the filter value is invalid.
    """
    try:
        query = get_booking_query(db)
        

        if date:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d").date()
                query = query.filter(func.date(Booking.created_at) == target_date)
            except ValueError:
                raise InvalidFilterException(
                    filter_value=date,
                    allowed_filters=["valid date format: YYYY-MM-DD"]
                )

        

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
        existing = db.query(Booking).filter(
            Booking.event_date == bookingDetails.event_date,
            Booking.event_time == bookingDetails.time_slot,
        ).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"The time slot '{bookingDetails.time_slot}' on {bookingDetails.event_date} is already booked. Please choose a different time."
            )

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

        user = get_user_by_username(bookingDetails.created_by, db) if bookingDetails.created_by else None

        booking = Booking(
            customer_id=customer.customer_id,
            package_id=bookingDetails.package_id,
            celebration_id=bookingDetails.celebration_id,
            event_date=bookingDetails.event_date,
            event_time=bookingDetails.time_slot,
            status=bookingDetails.status,
            notes=bookingDetails.addons_note,
             payment_mode=bookingDetails.payment_mode,
            payment_total=bookingDetails.payment_total,
            payment_paid=bookingDetails.payment_paid,
            payment_notes=bookingDetails.payment_notes,
            created_by=user.id if user else None,
            created_at=datetime.now(timezone.utc),
            additional_items = [item.dict() for item in bookingDetails.additional_items]
        )



        db.add(booking)
        db.commit()
        db.refresh(booking)

        # Look up package and celebration names for the notification
        package = db.get(Packages, bookingDetails.package_id)
        celebration = db.get(CelebrationType, bookingDetails.celebration_id)

        booking_data = {
            "customer_name": bookingDetails.customer_name,
            "phone_number": bookingDetails.phone_number,
            "email": bookingDetails.email,
            "address": bookingDetails.address,
            "event_date": str(bookingDetails.event_date),
            "time_slot": bookingDetails.time_slot,
            "package_name": package.package_name if package else str(bookingDetails.package_id),
            "celebration_name": celebration.celebration_name if celebration else str(bookingDetails.celebration_id),
            "addons_note": bookingDetails.addons_note,
            "payment_total": bookingDetails.payment_total,
            "payment_paid": bookingDetails.payment_paid,
            "payment_mode": bookingDetails.payment_mode,
            "status": bookingDetails.status,
        }

        # Send immediate confirmation and schedule reminders (non-blocking)
        try:
            import threading
            for fmt in ("%H:%M", "%I:%M %p", "%I:%M%p"):
                try:
                    slot_time = datetime.strptime(bookingDetails.time_slot.strip(), fmt).time()
                    break
                except ValueError:
                    continue
            else:
                slot_time = datetime.strptime("00:00", "%H:%M").time()
            event_datetime = datetime.combine(bookingDetails.event_date, slot_time)

            def _fire_and_forget():
                try:
                    notify_new_booking(booking_data)
                    schedule_reminders(booking_data, event_datetime)
                except Exception as e:
                    print(f"Telegram notification error: {e}")

            threading.Thread(target=_fire_and_forget, daemon=True).start()
        except Exception as telegram_err:
            print(f"Telegram thread error (non-fatal): {telegram_err}")

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
        booking.payment_mode=booking_details.payment_mode
        booking.payment_total=booking_details.payment_total
        booking.payment_paid=booking_details.payment_paid
        booking.payment_notes=booking_details.payment_notes
        booking.updated_at = datetime.now(timezone.utc)
        booking.updated_by = user.id
        booking.additional_items = [item.dict() for item in booking_details.additional_items]
        
        db.commit()
        return {
            "message": "Booking updated successfully",
            "booking_id": booking.booking_id
        }

    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating booking: {str(e)}")
    

def update_payment_detail(booking_id: int, booking_details: EditBookingDetails, db: Session) -> dict:
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
        booking.payment_paid=booking_details.payment_paid
        booking.updated_at = datetime.now(timezone.utc)
        booking.updated_by = user.id
        
        db.commit()
        return {
            "message": "payments updated successfully",
            "booking_id": booking.booking_id
        }

    except BookingDetailsNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating booking: {str(e)}")    
    


def get_booking_summary_by_customer_id(customer_id: int, db: Session) -> list[CustomerBookingSummary]:
    """
    Fetch the package, payment, and event date details for all bookings by a customer.

    Args:
        customer_id (int): ID of the customer.
        db (Session): SQLAlchemy database session.

    Returns:
        List[CustomerBookingSummary]: List of packages selected, payments made, and event dates.
    """
    try:
        results = fetch_booking_by_customer_id(customer_id, db)

        return [
            CustomerBookingSummary(
                booking_id=row.booking_id,
                package_name=row.package_name,
                payment_paid=row.payment_paid,
                event_date=row.event_date
            )
            for row in results
        ]

    except Exception as e:
        raise Exception(f"An error occurred while fetching booking summary: {e}")
    






def get_next_upcoming_booking(db: Session) -> BookingDetails:
    """
    Fetch the next upcoming booking for today.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        BookingDetails: Next upcoming booking.

    Raises:
        BookingDetailsNotFoundException: If no upcoming bookings are found.
    """
    try:
        query = get_booking_query(db)

        now = datetime.now().time()
        today = date.today()

        result = (
            query.filter(
                and_(
                    Booking.event_date == today,
                    Booking.event_time > now  
                )
            )
            .order_by(Booking.event_time.asc())
            .first()
        )

        if not result:
            raise BookingDetailsNotFoundException("No upcoming bookings found")

        return result

    except BookingDetailsNotFoundException:
        raise
    except Exception as e:
        raise Exception(f"An error occurred while fetching the next booking: {e}")

    