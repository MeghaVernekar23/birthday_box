from sqlalchemy.orm import Session
from db.models.sqlalchemy_models import Customer

def get_customer_details(filter= str, db= Session):

    return db.query(Customer).filter(Customer.phone_number == filter)
