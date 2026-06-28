
from pydantic import BaseModel
from datetime import date

class HolidayCreate(BaseModel):
    title: str
    date: date

class HolidayResponse(HolidayCreate):
    holiday_id: int

    model_config = {"from_attributes": True}
