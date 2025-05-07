
from fastapi import APIRouter, Depends, HTTPException
from db.sessions import create_tables
from db.models.pydantic_models import Token, UserCreate
from sqlalchemy.orm import Session
from db.sessions import get_db
from utils.exceptions import UserAlreadyExistsException, InvalidCredentialException
from services.users_services import create_user, authenticate_user
from services.oauth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

users_router = APIRouter()

create_tables()

@users_router.get("/users/me")
async def read_protected_data(current_user: str = Depends(get_current_user)):
    return current_user

@users_router.post("/users/add-user",response_model= Token)
async def add_user(user: UserCreate ,db: Session = Depends(get_db)):
    
    try:
        return create_user(user=user,db=db)
    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))   
    

@users_router.post("/users/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    try:
        return authenticate_user(user= form_data, db= db)       
    except InvalidCredentialException as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))     
    
