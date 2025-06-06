from sqlalchemy.orm import Session,aliased
from typing import List
from db.models.sqlalchemy_models import Booking, Customer, CelebrationType, Packages, Users
from fastapi import HTTPException

def get_user_by_username(username: str, db: Session) -> Users :
    """
    Retrieve a user from the database by username.

    Args:
        username (str): The username to search for.
        db (Session): SQLAlchemy database session.

    Returns:
        Users | None: User object if found, else None.
    """
    return db.query(Users).filter(Users.username == username).first()


def get_active_celebration_types(db: Session) -> List[CelebrationType]:
    """
    Fetch all active celebration types from the database.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[CelebrationType]: A list of active celebration types.
    """
    return db.query(CelebrationType).filter(CelebrationType.active == 1).all()


def get_active_packages(db: Session) -> List[Packages]:
    """
    Retrieve all active packages from the database.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[Packages]: A list of active packages.
    """
    return db.query(Packages).filter(Packages.is_active == 1).all()




def get_booking_query(db: Session) -> List[Booking]:
    """
    Build the SQLAlchemy query for booking details with all necessary joins.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        SQLAlchemy Query: The base booking query object.
    """
    try:
        updated_by_user = aliased(Users)
        created_by_user = aliased(Users)

        query = (
            db.query(
                Booking.booking_id,
                Customer.name.label("customer_name"),
                Customer.email,
                Customer.address,
                Customer.phone_number,
                Booking.event_date,
                Booking.event_time.label("time_slot"),
                Booking.celebration_id,
                Booking.package_id,
                CelebrationType.celebration_name.label("celebration_name"),  
                Packages.package_name.label("package_name"),   
                Booking.notes.label("addons_note"),
                Booking.status,
                Booking.created_at,
                Booking.updated_at,
                updated_by_user.username.label("updated_by"),
                created_by_user.username.label("created_by"),
            )
            .join(Customer, Booking.customer_id == Customer.customer_id)
            .join(CelebrationType, Booking.celebration_id == CelebrationType.celebration_id)
            .join(Packages, Booking.package_id == Packages.package_id)
            .join(updated_by_user, Booking.updated_by == updated_by_user.id, isouter=True)
            .join(created_by_user, Booking.created_by == created_by_user.id, isouter=True)
        )

        return query

    except Exception as e:
        raise Exception(f"An error occurred while building the booking query: {e}")

def get_customer_by_phone(phone_number: str, db: Session) -> Customer:
    """
    Retrieve a customer by phone number. 
    """
    return db.query(Customer).filter(Customer.phone_number == phone_number).first()


def fetch_all_customers(db: Session) -> List[Customer]:
    """
    Utility function to fetch all customers from the database.

    Args:
        db (Session): SQLAlchemy session object.

    Returns:
        List[Customer]: List of all customer objects.
    """
    return db.query(Customer).all()
    

def fetch_customer_by_id(customer_id: int, db: Session) -> Customer:
    """
    Fetch a customer by their ID.

    Args:
        customer_id (int): ID of the customer.
        db (Session): SQLAlchemy session.

    Returns:
        Customer: Customer object if found, else None.
    """
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()    