from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class AdditionalItem(BaseModel):
    description: str
    price: float
class BookingDetails(BaseModel):
    booking_id: int
    customer_name: str
    phone_number: str
    email: str
    address: str
    event_date: date
    time_slot: str
    celebration_id: int
    package_id: int
    celebration_name: str
    package_name: str
    addons_note: str
    status: str
    payment_mode: str
    payment_total: float
    payment_paid: float
    payment_notes: str
    created_by: str
    updated_by: Optional[str]  
    created_at: datetime 
    updated_at: Optional[datetime] 
    additional_items: Optional[List[AdditionalItem]] = []

    class Config:
        from_attributes = True  


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
    status: Optional[str] = "pending"
    payment_mode: Optional[str] = ""
    payment_total: Optional[float] = 0.0
    payment_paid: Optional[float] = 0.0
    payment_notes: Optional[str] = ""
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    additional_items: Optional[List[AdditionalItem]] = []


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
    payment_mode: str
    payment_total: float
    payment_paid: float
    payment_notes: str
    created_by: str
    updated_by: Optional[str]  
    created_at: datetime 
    updated_at: Optional[datetime] 
    additional_items: Optional[List[AdditionalItem]] = []

class CustomerBookingSummary(BaseModel):
    booking_id: int
    package_name: str
    payment_paid: Optional[float] = 0.0
    event_date: date    