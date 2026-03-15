from sqlalchemy.orm import Session
from db.models.sqlalchemy_models import Customer
from typing import Optional, List
from utils.exceptions import CustomerNotFoundException, CustomerAlreadyExistsException
from fastapi import HTTPException
from utils.db_utils import get_customer_by_phone, fetch_all_customers, fetch_customer_by_id
from db.models.customer_pydantic_model import CustomerDetails, AddCustomerDetails

def get_customer_by_phoneno(phone_number: str, db: Session) -> Optional[CustomerDetails]:
    """
    Fetch customer details from the database based on the provided phone number.

    Args:
        phone_number (str): The phone number of the customer to fetch.
        db (Session): SQLAlchemy session object.

    Returns:
        Customer: Customer object if found.

    Raises:
        CustomerDetailsNotFoundException: If customer with the given phone number is not found.
        Exception: For general database errors.
    """
    try:
        customer= get_customer_by_phone(phone_number= phone_number , db= db)

        if not customer:
            raise CustomerNotFoundException(
                f"Customer with phone number {phone_number} not found."
            )
        return customer
    except CustomerNotFoundException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occured while fetching customer details : {str(e)}")
    

def get_all_customer_details(db: Session) -> List[CustomerDetails]:
    """
    Fetch all customer details from the database.

    Args:
        db (Session): SQLAlchemy session object.

    Returns:
        List[Customer]: List of all customer objects.

    Raises:
        Exception: For general database errors.
    """
    try:
        customers = fetch_all_customers(db)

        if not customers:
            return []  

        return customers

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occured while fetching customer details : {str(e)}")  
    


def add_customer_details(customer_details: AddCustomerDetails, db: Session) -> dict:
    """
    Adds a new customer to the database if not already present.

    Args:
        customer_data (CustomerDetails): customer details (e.g., name, phone_number).
        db (Session): SQLAlchemy session.

    Returns:
       dict: Success message and customer ID.

    Raises:
        Exception: If customer already exists or database error occurs.
    """
    try:
        customer = get_customer_by_phone(customer_details.phone_number, db)
        if customer:
            raise CustomerAlreadyExistsException(f"Customer with phone number {customer_details.phone_number} already exists")
       
        customer = Customer(
                        name=customer_details.name,
                        phone_number=customer_details.phone_number,
                        email=customer_details.email,
                        address=customer_details.address
                    )
        db.add(customer)
        db.commit()
        db.refresh(customer)            

        return {
            "message": "Booking created successfully",
            "customer_id": customer.customer_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")   
    

def update_customer_details(customer_id: int, customer_data, db: Session) -> dict:
    """
    Update customer details in the database.

    Args:
        customer_id (int): ID of the customer to update.
        customer_data (Pydantic model): Fields to update.
        db (Session): SQLAlchemy session.

    Returns:
        dict: Success message.

    Raises:
        Exception: If customer not found or a DB error occurs.
    """
    try:
        customer = fetch_customer_by_id(customer_id, db)
        if not customer:
            raise CustomerNotFoundException(
                f"Customer with Id {customer_id} not found."
            )

        for key, value in customer_data.dict(exclude_unset=True).items():
            setattr(customer, key, value)

        db.commit()
        db.refresh(customer)

        return {"message": f"Customer {customer_id} updated successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating customer details: {str(e)}")  


def delete_customer_details(customer_id: int, db: Session) -> dict:
    """
    Delete a customer by ID.

    Args:
        customer_id (int): ID of the customer to delete.
        db (Session): SQLAlchemy session.

    Returns:
        dict: Success message.

    Raises:
        Exception: If customer not found or a DB error occurs.
    """
    try:
        customer = fetch_customer_by_id(customer_id, db)
        if not customer:
            raise CustomerNotFoundException(
                f"Customer with Id {customer_id} not found."
            )

        db.delete(customer)
        db.commit()

        return {"message": f"Customer {customer_id} deleted successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating customer details: {str(e)}")  