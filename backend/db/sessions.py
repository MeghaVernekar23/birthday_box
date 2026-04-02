from sqlalchemy import create_engine
import os
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from collections.abc import Generator

Base = declarative_base()

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

SEED_USERS = [
    {"username": "rohit",    "password": "rohit",                  "role": "admin"},
    {"username": "customer", "password": "customer@birthdaybox",   "role": "customer"},
]

SEED_PACKAGES = [
    {"package_name": "SIMPLE PACKAGE",           "description": "BALLOON DECORATION + 🎁 SURPRISE GIFT",                                              "price": 499,  "is_active": 1},
    {"package_name": "BASIC",                    "description": "BALLOON DECORATION + PRIVATE SCREENING + MUSIC",                                     "price": 999,  "is_active": 1},
    {"package_name": "CLASSIC PACKAGE",          "description": "BASIC + GAMES + GIFT",                                                               "price": 1299, "is_active": 1},
    {"package_name": "DYNAMIC PACKAGE",          "description": "CLASSIC + FOG ENTRY",                                                                "price": 1799, "is_active": 1},
    {"package_name": "ELITE PACKAGE",            "description": "DYNAMIC + 1/2KG PASTRY CAKE",                                                        "price": 2199, "is_active": 1},
    {"package_name": "GOLDEN GLOW PACKAGE",      "description": "ELITE + FIRE ENTRY",                                                                 "price": 2699, "is_active": 1},
    {"package_name": "DREAM CELEBRATION PACKAGE","description": "GOLDEN GLOW + COMPLEMENTARY WELCOME DRINKS + 1HR PHOTOSHOOT (50 PICS)",              "price": 4999, "is_active": 1},
    {"package_name": "IPL STREAMING EXPERIENCE", "description": "IPL STREAMING EXPERIENCE AT BIRTHDAY BOX PER HEAD",                                  "price": 150,  "is_active": 1},
]

SEED_CELEBRATION_TYPES = [
    {"celebration_name": "BIRTHDAY PARTIES",              "active": 1},
    {"celebration_name": "TEEN CELEBRATION NIGHTS",       "active": 1},
    {"celebration_name": "PRIVATE MOVIE NIGHTS",          "active": 1},
    {"celebration_name": "ANNIVERSARY CELEBRATIONS",      "active": 1},
    {"celebration_name": "BABY SHOWER / GENDER REVEAL",   "active": 1},
    {"celebration_name": "RETIREMENT OR FAREWELL PARTIES","active": 1},
    {"celebration_name": "PROPOSAL OR ROMANTIC DATE SETUP","active": 1},
    {"celebration_name": "BRIDE-TO-BE CELEBRATION",       "active": 1},
    {"celebration_name": "MOTHER'S DAY CELEBRATION",      "active": 1},
    {"celebration_name": "FATHER'S DAY CELEBRATION",      "active": 1},
]


def seed_data() -> None:
    from db.models.sqlalchemy_models import Users, Packages, CelebrationType
    from services.oauth import hash_password
    db = SessionLocal()
    try:
        for u in SEED_USERS:
            if not db.query(Users).filter(Users.username == u["username"]).first():
                db.add(Users(
                    username=u["username"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                ))

        if db.query(Packages).count() == 0:
            for p in SEED_PACKAGES:
                db.add(Packages(**p))

        if db.query(CelebrationType).count() == 0:
            for c in SEED_CELEBRATION_TYPES:
                db.add(CelebrationType(**c))

        db.commit()
    finally:
        db.close()


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    seed_data()

    

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()
