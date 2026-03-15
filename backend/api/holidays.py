from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from services.oauth import get_current_user
from db.sessions import get_db
from db.models.holidays_pydantic import HolidayResponse, HolidayCreate
from services.holidays_services import get_all_holidays, create_holiday, delete_holiday_by_id

holidays_router = APIRouter(
    prefix="/holidays",
    tags=["Holidays"],
    responses={404: {"description": "Not Found"}},
)


@holidays_router.get(
    "/",
    response_model=List[HolidayResponse],
    dependencies=[Depends(get_current_user)],
    description="Retrieve all upcoming holidays.",
)
def get_holidays(db: Session = Depends(get_db)) -> List[HolidayResponse]:
    """
    Retrieve a list of all upcoming holidays.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[HolidayResponse]: List of holidays.
    """
    try:
        return get_all_holidays(db)
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
    

@holidays_router.post(
    "/submit",
    response_model=HolidayResponse,
    dependencies=[Depends(get_current_user)],
    description="Add a new holiday to block bookings on that date.",
)
def add_holiday(holiday: HolidayCreate, db: Session = Depends(get_db)) -> HolidayResponse:
    """
    Add a new holiday.

    Args:
        holiday (HolidayCreate): Holiday title and date.
        db (Session): SQLAlchemy database session.

    Returns:
        HolidayResponse: Created holiday details.
    """
    try:
        return create_holiday(holiday, db)
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail=str(e))

@holidays_router.delete(
        
        
    "/{holiday_id}",
    dependencies=[Depends(get_current_user)],
    description="Delete a holiday by its ID.",
)
def delete_holiday(holiday_id: int, db: Session = Depends(get_db)) -> dict:
    """
    Delete a holiday.

    Args:
        holiday_id (int): ID of the holiday to delete.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Message confirming deletion.
    """
    try:
        delete_holiday_by_id(holiday_id, db)
        return {"message": "Holiday deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
