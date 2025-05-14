from sqlalchemy.orm import Session
from datetime import date
from db.models.sqlalchemy_models import Booking, Customer, Service, Users


def get_bookings_details(filter= str, db= Session):
        
    today = date.today()

    print("date:", today)
    query = (
        db.query(
            Booking.id,
            Customer.name.label("customer_name"),
            Booking.event_date,
            Customer.phone_number,
            Booking.event_time.label("time_slot"),
            Service.name.label("package_name"),
            Booking.status,
            Users.username.label("updated_by")
        )
        .join(Customer, Booking.customer == Customer.id)
        .join(Service, Booking.service_id == Service.id)
        .join(Users, Booking.updated_by == Users.id, isouter=True)
    )
        
    if filter == "today":
        print("inside today")
        query = query.filter(Booking.event_date == today)
    elif filter == "future":
        print("inside future")
        query = query.filter(Booking.event_date > today)
    elif filter == "past":
        print("inside past")
        query = query.filter(Booking.event_date < today)
        
    results = query.order_by(Booking.event_date).all()
        
    return results
