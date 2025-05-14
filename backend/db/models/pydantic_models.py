
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

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
    id: int
    customer_name: str
    phone_number: str
    event_date: date
    time_slot: str
    package_name: str
    status: str
    updated_by: str

    class Config:
        orm_mode = True    