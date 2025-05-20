from sqlalchemy.orm import Session
from db.models.sqlalchemy_models import Customer

def get_customer_details(phone_number= str, db= Session):

    return db.query(Customer).filter(Customer.phone_number == phone_number)
