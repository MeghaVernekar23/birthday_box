from pydantic import BaseModel


class CustomerDetails(BaseModel):
    customer_id: int
    name: str
    phone_number: str
    email: str
    address: str

class AddCustomerDetails(BaseModel):
    name: str
    phone_number: str
    email: str
    address: str    