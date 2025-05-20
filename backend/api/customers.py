from fastapi import APIRouter, Depends, HTTPException, Query
from db.models.pydantic_models import CustomerDetails
from db.sessions import create_tables
from services.oauth import get_current_user
from sqlalchemy.orm import Session
from db.sessions import get_db
from services.customers_service import get_customer_details

customer_router = APIRouter()

create_tables()


@customer_router.get("/customer-details/{phone_number}", response_model=list[CustomerDetails], dependencies=[Depends(get_current_user)])
def get_customer(phone_number: str,db: Session = Depends(get_db)):
    try:
        return get_customer_details(phone_number = phone_number, db= db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  