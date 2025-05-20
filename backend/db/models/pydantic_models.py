

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class UserBase(BaseModel):
    username: str
    role: str
    email: str = None
    phone_number: str = None


class UserCreate(UserBase):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str    
    role: str

class BookingDetails(BaseModel):
    booking_id: int
    customer_name: str
    phone_number: str
    event_date: date
    time_slot: str
    celebration_name: str
    package_name: str
    status: str
    updated_by: Optional[str]

    class Config:
        orm_mode = True    


class CelebrationDetails(BaseModel):
    celebration_id: int
    celebration_name: str
    active: int


class PackageDetails(BaseModel):
    package_id: int
    package_name: str
    description: str
    price: int
    is_active: int    
    

class AddBookingDetails(BaseModel):
    customer_name: str
    phone_number: str
    email: str
    address: str
    event_date: date
    time_slot: str
    celebration_id: int
    package_id: int
    addons_note: str
    status: str
    created_by: str
    updated_by: Optional[str]

class EditBookingDetails(BaseModel):
    booking_id: int
    customer_name: str
    phone_number: str
    email: str
    address: str
    event_date: date
    time_slot: str
    celebration_id: int
    package_id: int
    addons_note: str
    status: str
    created_by: str
    updated_by: Optional[str]  
    created_at: datetime 
    updated_at: Optional[datetime] 


class CustomerDetails(BaseModel):
    name: str
    phone_number: str
    email: str
    address: str
