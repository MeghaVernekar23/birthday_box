
from sqlalchemy.orm import Session
from db.models.pydantic_models import  UserCreate
from db.models.sqlalchemy_models import Users
from utils.exceptions import UserAlreadyExistsException, InvalidCredentialException
from services.oauth import hash_password, create_access_token, verify_password
from fastapi.security import OAuth2PasswordRequestForm

def create_user(user: UserCreate , db: Session) -> dict:
    
    existing_user = db.query(Users).filter(Users.username == user.username).first()
    if existing_user:
        raise UserAlreadyExistsException()
    
    hashed_pwd = hash_password(user.password)
    new_user_data = Users(username=user.username,role=user.role,
                     email=user.email,phone_number=user.phone_number,password_hash=hashed_pwd)
    
    db.add(new_user_data)
    db.commit()
    db.refresh(new_user_data)
    access_token = create_access_token(data={"sub": new_user_data.username, "role": new_user_data.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user_data.role  
    }

def authenticate_user(user: OAuth2PasswordRequestForm , db: Session) -> dict:
    
    user_detail =  db.query(Users).filter(Users.username == user.username).first()
    if not user_detail:
        raise InvalidCredentialException("Invalid username. Please enter Valid email Id")   
    
    if not verify_password(user.password, user_detail.password_hash): 
        raise InvalidCredentialException("Invalid password. Please enter valid Password")
    
    access_token = create_access_token(data={
        "sub": user_detail.username,
        "role": user_detail.role
    })
    
    return {"access_token": access_token, "token_type": "bearer", "role": user_detail.role  }