from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    staff = "staff"

class UserBase(BaseModel):
    username: str
    role: UserRole
    email: str = None
    phone_number: str = None


class UserCreate(UserBase):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str    
    role: str


class UserResponse(BaseModel):
    username: str
    role: str 

