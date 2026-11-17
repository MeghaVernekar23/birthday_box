from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.sessions import get_db
from services.public_booking_service import get_public_booking


public_router = APIRouter(prefix="/public", tags=["Public"])


class PublicBookingAccess(BaseModel):
    password: str


@public_router.post(
    "/booking/{token}",
    description="Customer-facing booking details, unlocked with the booking password. No login required.",
)
def view_public_booking(token: str, body: PublicBookingAccess, db: Session = Depends(get_db)) -> dict:
    return get_public_booking(token, body.password, db)
