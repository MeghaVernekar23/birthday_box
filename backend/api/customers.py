from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.models.customer_pydantic_model import CustomerDetails, AddCustomerDetails
from db.sessions import get_db
from services.oauth import get_current_user
from services.customers_service import get_customer_by_phoneno, get_all_customer_details, add_customer_details, update_customer_details, delete_customer_details
from utils.exceptions import CustomerNotFoundException


customer_router = APIRouter(
    prefix="/customers",
    tags=["Customer"],
    responses={404: {"description": "Not Found"}},
)


@customer_router.get("/", response_model=List[CustomerDetails])
def get_all_customers(db: Session = Depends(get_db)):
    """
    API endpoint to fetch all customer details.

    Args:
        db (Session): SQLAlchemy session object provided by FastAPI dependency.

    Returns:
        List[Customer]: List of all customers.
    """
    try:
        customers = get_all_customer_details(db)
        return customers

    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")



@customer_router.get(
    "/details/{phone_number}",
    response_model=CustomerDetails,
    dependencies=[Depends(get_current_user)],
    description="Fetch customer details by phone number.",
)
def get_customer(
    phone_number: str,
    db: Session = Depends(get_db),
) -> CustomerDetails:
    """
    Retrieve customer details based on phone number.

    Args:
        phone_number (str): The phone number to search for.
        db (Session): SQLAlchemy database session.

    Returns:
        List[CustomerDetails]: List of customer details matching the phone number.
    """
   
    try:
        return get_customer_by_phoneno(phone_number=phone_number, db=db)
    except CustomerNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
    
@customer_router.post(
    "/submit",
    response_model=dict,
    dependencies=[Depends(get_current_user)],
    description="Submit a new customer.",
)
def create_customer(
    customer_details: AddCustomerDetails,
    db: Session = Depends(get_db),
) -> dict:
    """
    Submit a new customer details.

    Args:
        customer_details (CustomerDetails): Details of the customer to add.
        db (Session): SQLAlchemy database session.

    Returns:
        str: Confirmation message.
    """
    try:
        return add_customer_details(customer_details= customer_details, db=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail={str(e)})    
    

@customer_router.put(
    "/update/{customer_id}",
    response_model=dict,
    dependencies=[Depends(get_current_user)],
    description="Edit an existing customer's details.",
)
def edit_customer(
    customer_id: int,
    customer_details: CustomerDetails,
    db: Session = Depends(get_db),
) -> dict:
    """
    Edit an existing customer's details.

    Args:
        customer_id (int): ID of the customer to edit.
        customer_details (CustomerUpdate): Fields to update.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Success message.
    """
    try:
        return update_customer_details(customer_id=customer_id, customer_data=customer_details, db=db)
    except CustomerNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail={str(e)})

@customer_router.delete(
    "/delete/{customer_id}",
    response_model=dict,
    dependencies=[Depends(get_current_user)],
    description="Delete a customer by ID.",
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
) -> dict:
    """
    Delete a customer by ID.

    Args:
        customer_id (int): ID of the customer to delete.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Success message.
    """
    try:
        return delete_customer_details(customer_id=customer_id, db=db)
    except CustomerNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail={str(e)})