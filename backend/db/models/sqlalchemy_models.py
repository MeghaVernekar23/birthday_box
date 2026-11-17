
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Float
from sqlalchemy.sql import func
from db.sessions import Base
from sqlalchemy.orm import relationship
import datetime
from sqlalchemy.dialects.sqlite import JSON

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    package_id = Column(Integer, ForeignKey("packages.package_id"))
    celebration_id = Column(Integer, ForeignKey("celebration_type.celebration_id"))
    # Name of the person being celebrated for this booking. A returning customer
    # (same phone number) may book for someone else; falls back to Customer.name.
    celebrant_name = Column(String, nullable=True)
    # Price actually charged for the package (depends on duration, so it can
    # differ from Packages.price). payment_total = package_price + sum(additional_items).
    package_price = Column(Float, nullable=True)
    duration = Column(String, nullable=True)          # e.g. "1.5 Hours (Classic)"
    referral_source = Column(String, nullable=True)   # e.g. "Instagram"
    customer_message = Column(Text, nullable=True)
    booked_by_staff = Column(Integer, nullable=False, server_default="0")
    # Public, password-protected booking page shared with the customer.
    # Password = access_pin + last 4 digits of the customer's phone.
    public_token = Column(String, unique=True, index=True, nullable=True)
    access_pin = Column(String(4), nullable=True)
    access_failed_attempts = Column(Integer, nullable=False, server_default="0")
    access_locked_until = Column(DateTime, nullable=True)
    event_date = Column(Date)
    event_time = Column(String)
    location = Column(Text)
    status = Column(String, default="confirmed")
    notes = Column(Text)
    payment_mode = Column(String)
    payment_total = Column(Float)
    payment_paid = Column(Float)
    payment_notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime) 
    additional_items = Column(JSON)



class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    email = Column(String)
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)  

class Packages(Base):
    __tablename__ = "packages"
    package_id = Column(Integer, primary_key=True, index=True)
    package_name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    is_active = Column(Integer, nullable=False, server_default="1")    


class CelebrationType(Base):
    __tablename__ = "celebration_type"
    celebration_id = Column(Integer, primary_key=True, index=True)
    celebration_name = Column(String, nullable=False, unique=True)
    active = Column(Integer)    


class Holiday(Base):
    __tablename__ = "holidays"

    holiday_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(Date, nullable=False, unique=True)
   
