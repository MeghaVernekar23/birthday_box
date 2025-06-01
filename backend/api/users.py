from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from db.sessions import get_db
from db.models.user_pydantic_model import Token, UserCreate, UserResponse
from services.users_services import create_user, authenticate_user
from services.oauth import get_current_user
from utils.exceptions import UserAlreadyExistsException, InvalidCredentialException

# Initialize the router
users_router = APIRouter(
    prefix="/users",
    tags=["User"],
    responses={404: {"description": "Not found"}},
)

@users_router.get(
    "/me",
    response_model=UserResponse,
    description="Return the current authenticated user's details",
)
async def read_protected_data(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieve the currently authenticated user's details.

    Args:
        current_user (dict): User information retrieved from dependency.

    Returns:
        dict: The user's username and role.
    """
    return current_user


@users_router.post(
    "/add-user",
    response_model=Token,
    description="Create a new user and return an authentication token.",
)
async def add_user(
    user: UserCreate,
    db: Session = Depends(get_db),
) -> Token:
    """
    Create a new user account.

    Args:
        user (UserCreate): The user details for creating the account.
        db (Session): SQLAlchemy database session.

    Returns:
        Token: The access token for the newly created user.

    Raises:
        HTTPException: If the user already exists or an unexpected error occurs.
    """
    try:
        return create_user(user=user, db=db)
    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@users_router.post(
    "/login",
    response_model=Token,
    description="Authenticate an existing user and return an access token.",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """
    Authenticate a user and return an access token.

    Args:
        form_data (OAuth2PasswordRequestForm): Login form containing username and password.
        db (Session): SQLAlchemy database session.

    Returns:
        Token: The access token for the authenticated user.

    Raises:
        HTTPException: If the credentials are invalid or an unexpected error occurs.
    """
    try:
        return authenticate_user(user=form_data, db=db)
    except InvalidCredentialException as e:
        raise HTTPException(status_code=401, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
