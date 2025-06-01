from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.models.customer_pydantic_model import CustomerDetails
from db.sessions import get_db
from services.oauth import get_current_user
from services.customers_service import get_customer_details

# Initialize the router
customer_router = APIRouter(
    prefix="/customers",
    tags=["Customer"],
    responses={404: {"description": "Not Found"}},
)


@customer_router.get(
    "/details/{phone_number}",
    response_model=List[CustomerDetails],
    dependencies=[Depends(get_current_user)],
    description="Fetch customer details by phone number.",
)
def get_customer(
    phone_number: str,
    db: Session = Depends(get_db),
) -> List[CustomerDetails]:
    """
    Retrieve customer details based on phone number.

    Args:
        phone_number (str): The phone number to search for.
        db (Session): SQLAlchemy database session.

    Returns:
        List[CustomerDetails]: List of customer details matching the phone number.
    """
    try:
        return get_customer_details(phone_number=phone_number, db=db)
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
