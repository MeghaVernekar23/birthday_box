
from sqlalchemy.orm import Session
from db.models.user_pydantic_model import  UserCreate
from db.models.sqlalchemy_models import Users
from utils.exceptions import UserAlreadyExistsException, InvalidCredentialException
from services.oauth import hash_password, create_access_token, verify_password
from fastapi.security import OAuth2PasswordRequestForm
from utils.db_utils import get_user_by_username

def create_user(user: UserCreate, db: Session) -> dict:
    """
    Create a new user in the database and generate an access token.

    Args:
        user (UserCreate): User details for registration.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Access token details including token, type, and role.

    Raises:
        UserAlreadyExistsException: If the username already exists.
    """
    try:
        
        existing_user = get_user_by_username(user.username, db)
        if existing_user:
            raise UserAlreadyExistsException(f"User with username '{user.username}' already exists.")

        
        hashed_password = hash_password(user.password)

       
        new_user = Users(
            username=user.username,
            role=user.role.value,
            email=user.email,
            phone_number=user.phone_number,
            password_hash=hashed_password,
        )

        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        
        access_token = create_access_token(
            data={"sub": new_user.username, "role": new_user.role}
        )

        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": new_user.role,
        }

    except UserAlreadyExistsException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise Exception(f"An error occurred while creating the user: {e}")



def authenticate_user(user: OAuth2PasswordRequestForm, db: Session) -> dict:
    """
    Authenticate a user based on username and password.

    Args:
        user (OAuth2PasswordRequestForm): Login form containing username and password.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Access token details including token, type, and role.

    Raises:
        InvalidCredentialException: If username or password is invalid.
        Exception: For unexpected errors.
    """
    try:
        
        user_detail = get_user_by_username(user.username, db)
        if not user_detail:
            raise InvalidCredentialException("Invalid credential. Please enter a valid username and password.")

        
        if not verify_password(user.password, user_detail.password_hash):
            raise InvalidCredentialException("Invalid credential. Please enter a valid username and password.")

        
        access_token = create_access_token(
            data={"sub": user_detail.username, "role": user_detail.role}
        )

        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user_detail.role,
        }

    except InvalidCredentialException as e:
        raise e
    except Exception as e:
        raise Exception(f"An error occurred while authenticating the user: {e}")