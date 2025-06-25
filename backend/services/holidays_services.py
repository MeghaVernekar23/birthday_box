from sqlalchemy.orm import Session
from db.models.sqlalchemy_models import Holiday
from db.models.holidays_pydantic import HolidayCreate
from fastapi import HTTPException
from datetime import date

def get_all_holidays(db: Session):
    """
    Get all holidays from the database, sorted by date.
    """
    return db.query(Holiday).order_by(Holiday.date).all()


def create_holiday(holiday_data: HolidayCreate, db: Session):
    """
    Add a new holiday to the database.

    Raises:
        HTTPException: if holiday already exists on the same date.
    """
    existing = db.query(Holiday).filter(Holiday.date == holiday_data.date).first()
    if existing:
        raise HTTPException(status_code=400, detail="A holiday already exists on this date.")

    holiday = Holiday(title=holiday_data.title, date=holiday_data.date)
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    return holiday


def delete_holiday_by_id(holiday_id: int, db: Session):
    """
    Delete a holiday by its ID.

    Raises:
        HTTPException: if the holiday does not exist.
    """
    holiday = db.query(Holiday).filter(Holiday.holiday_id == holiday_id).first()
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found.")

    db.delete(holiday)
    db.commit()
