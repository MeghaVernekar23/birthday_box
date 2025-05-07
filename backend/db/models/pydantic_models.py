
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    role: str
    email: str = None
    phone_number: str = None


class UserCreate(UserBase):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str    
    role: str