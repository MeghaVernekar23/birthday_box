from pydantic import BaseModel


class CustomerDetails(BaseModel):
    name: str
    phone_number: str
    email: str
    address: str