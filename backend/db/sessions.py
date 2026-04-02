from sqlalchemy import create_engine
import os
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from collections.abc import Generator

Base = declarative_base()

CUSTOMER_USERNAME = "customer"
CUSTOMER_PASSWORD = "customer@birthdaybox"

# Lazy-load engine and sessionmaker
# def get_engine():
#     DB_HOST = os.getenv("PG_HOST", "localhost")
#     DB_PORT = os.getenv("PG_PORT", "5433")
#     DB_NAME = os.getenv("PG_DATABASE", "birthday_box")
#     DB_USER = os.getenv("PG_USER", "postgres")
#     DB_PASS = os.getenv("PG_PASSWORD", "admin")
#     DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
#     return create_engine(DATABASE_URL)

DATABASE_URL = "sqlite:///./birthdayBox.db"
engine = create_engine(DATABASE_URL, echo=True)

# engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_customer_user() -> None:
    from db.models.sqlalchemy_models import Users
    from services.oauth import hash_password
    db = SessionLocal()
    try:
        existing = db.query(Users).filter(Users.username == CUSTOMER_USERNAME).first()
        if not existing:
            user = Users(
                username=CUSTOMER_USERNAME,
                password_hash=hash_password(CUSTOMER_PASSWORD),
                role="customer",
            )
            db.add(user)
            db.commit()
    finally:
        db.close()


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    seed_customer_user()

    

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()
