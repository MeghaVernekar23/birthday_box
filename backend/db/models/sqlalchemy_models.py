
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from db.sessions import Base
from sqlalchemy.orm import relationship
import datetime

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
    event_date = Column(Date)
    event_time = Column(String)
    location = Column(Text)
    status = Column(String, default="pending")
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime)    


class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone_number = Column(String)
    email = Column(String)
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)  

class Packages(Base):
    __tablename__ = "packages"
    package_id = Column(Integer, primary_key=True, index=True)
    package_name = Column(String)
    description = Column(Text)
    price = Column(Integer)
    is_active = Column(Integer)    


class CelebrationType(Base):
    __tablename__ = "celebration_type"
    celebration_id = Column(Integer, primary_key=True, index=True)
    celebration_name = Column(String)
    active = Column(Integer)    


   
