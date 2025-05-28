from sqlalchemy.orm import Session, aliased
from datetime import date
from db.models.sqlalchemy_models import Booking, Customer, Packages, Users, CelebrationType
from db.models.pydantic_models import AddBookingDetails, EditBookingDetails
from utils.exceptions import BookingDetailsNotFoundException
from fastapi import HTTPException
from datetime import datetime, timezone

def get_bookings_details(filter= str, db= Session):
        
    today = date.today()

    print("date:", today)
    query = (
        db.query(
            Booking.booking_id,
            Customer.name.label("customer_name"),
            Booking.event_date,
            Customer.phone_number,
            Booking.event_time.label("time_slot"),
            CelebrationType.celebration_name.label("celebration_name"),
            Packages.package_name.label("package_name"),
            Booking.status,
            Users.username.label("updated_by")
        )
        .join(Customer, Booking.customer_id == Customer.customer_id)
        .join(CelebrationType, Booking.celebration_id == CelebrationType.celebration_id)
        .join(Packages, Booking.package_id == Packages.package_id)
        .join(Users, Booking.updated_by == Users.id, isouter=True)
    )
        
    if filter == "today":
        query = query.filter(Booking.event_date == today)
    elif filter == "future":    
        query = query.filter(Booking.event_date > today)
    elif filter == "past":   
        query = query.filter(Booking.event_date < today)
    elif filter == "all": 
        query = query.filter(Booking.event_date >= today)
        
    results = query.order_by(Booking.event_date).all()
        
    return results


def get_booking_details_by_id(booking_id: int, db: Session):

    
    updated_by_user = aliased(Users)
    created_by_user = aliased(Users)

    query = (
    db.query(
        Booking.booking_id,
        Customer.name.label("customer_name"),
        Customer.email,
        Customer.address,
        Customer.phone_number,
        Booking.event_date,
        Booking.event_time.label("time_slot"),
        Booking.celebration_id,  
        Booking.package_id,      
        Booking.notes.label("addons_note"),  
        Booking.status,
        Booking.created_at,
        Booking.updated_at,
        updated_by_user.username.label("updated_by"),
        created_by_user.username.label("created_by"),
    )
    .join(Customer, Booking.customer_id == Customer.customer_id)
    .join(CelebrationType, Booking.celebration_id == CelebrationType.celebration_id)
    .join(Packages, Booking.package_id == Packages.package_id)
    .join(updated_by_user, Booking.updated_by == updated_by_user.id, isouter=True)
    .join(created_by_user, Booking.created_by == created_by_user.id, isouter=True)
    .filter(Booking.booking_id == booking_id)
    .first()
)

    if not query:
        raise BookingDetailsNotFoundException()
    return query



def get_celebration_type(db= Session):

    return db.query(CelebrationType).filter(CelebrationType.active == 1)


def get_package(db= Session):

    return db.query(Packages).filter(Packages.is_active == 1)


def add_booking_details(bookingDetails= AddBookingDetails, db= Session):

 
    customer = Customer(name = bookingDetails.customer_name, phone_number = bookingDetails.phone_number, 
                        email = bookingDetails.email, address = bookingDetails.address)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    get_customer = db.query(Customer).filter(Customer.phone_number == bookingDetails.phone_number).first()

    get_created_by = db.query(Users).filter(Users.username == bookingDetails.created_by).first()

    booking = Booking(customer_id= get_customer.customer_id, package_id= bookingDetails.package_id,celebration_id= bookingDetails.celebration_id, event_date= bookingDetails.event_date, event_time= bookingDetails.time_slot,
                      status= bookingDetails.status, notes= bookingDetails.addons_note, created_by= get_created_by.id,created_at=datetime.now(timezone.utc) 
                      )

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {"message": "Booking Created successfully"}


def delete_booking_detail(booking_id= int,db= Session):
    try:
        bookings = db.get(Booking,booking_id)
        if not bookings:
            raise BookingDetailsNotFoundException()
        
        db.delete(bookings)
        db.commit()
        return {"message": "booking deleted successfully"}
    except BookingDetailsNotFoundException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    


def update_booking_detail(booking_id= int,booking_details= EditBookingDetails, db= Session):
    from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

def update_booking_detail(booking_id: int, booking_details: EditBookingDetails, db: Session):
    try:
        booking = db.get(Booking, booking_id)
        if not booking:
            raise BookingDetailsNotFoundException(f"Booking with ID {booking_id} not found.")

        
        
        booking.package_id = booking_details.package_id
        booking.celebration_id = booking_details.celebration_id
        booking.event_date = booking_details.event_date
        booking.event_time = booking_details.time_slot
        booking.notes = booking_details.addons_note
        booking.status = booking_details.status
        booking.updated_by = (
        db.query(Users).filter(Users.username == booking_details.updated_by).first().id
        if booking_details.updated_by else None
            )
        
        booking.updated_at = datetime.now(timezone.utc)

        
        customer = db.query(Customer).filter(Customer.phone_number == booking_details.phone_number).first()
        if customer:
            customer.name = booking_details.customer_name
            customer.email = booking_details.email
            customer.address = booking_details.address

        db.commit()
        return {"message": "Booking updated successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating booking: {str(e)}")
    