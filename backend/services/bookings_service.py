from sqlalchemy.orm import Session
from datetime import date
from db.models.sqlalchemy_models import Booking, Customer, Packages, Users, CelebrationType
from db.models.pydantic_models import AddBookingDetails


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
            Packages.package_name.label("package_name"),
            Booking.status,
            Users.username.label("updated_by")
        )
        .join(Customer, Booking.customer_id == Customer.customer_id)
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


def get_celebration_type(db= Session):

    return db.query(CelebrationType).filter(CelebrationType.active == 1)


def get_package(db= Session):

    return db.query(Packages).filter(Packages.is_active == 1)


def add_booking_details(bookingDetails= AddBookingDetails, db= Session):

    get_customer = db.query(Customer).filter(Customer.phone_number == bookingDetails.phone_number).first()
    if not get_customer:
        customer = Customer(name = bookingDetails.customer_name, phone_number = bookingDetails.phone_number, email = bookingDetails.email, address = bookingDetails.address)
        db.add(customer)
        db.commit()
        db.refresh(customer)
        get_customer = db.query(Customer).filter(Customer.phone_number == bookingDetails.phone_number).first()

    get_created_by = db.query(Users).filter(Users.username == bookingDetails.created_by).first()

    booking = Booking(customer_id= get_customer.customer_id, package_id= bookingDetails.package_id,celebration_id= bookingDetails.celebration_id, event_date= bookingDetails.event_date, event_time= bookingDetails.time_slot,
                      status= bookingDetails.status, notes= bookingDetails.addons_note, created_by= get_created_by.id
                      )

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {"message": "Booking Created successfully"}