
from pydantic import BaseModel
from datetime import date

class HolidayCreate(BaseModel):
    title: str
    date: date

class HolidayResponse(HolidayCreate):
    holiday_id: int

    class Config:
        orm_mode = True
