from fastapi import FastAPI
from api.users import users_router
from api.bookings import bookings_router
from api.customers import customer_router
from api.health import health_router
from fastapi.middleware.cors import CORSMiddleware
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from db.sessions import create_tables

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    create_tables()
    yield

app = FastAPI(
    title="Birthday Box API",
    version="0.1.0",
    lifespan=lifespan,
    description="API implementation for managing Birthday Box events, bookings, and customer data.",
    contact={"name": "Megha Vernekar"},
    openapi_tags=[
        {
            "name": "Health",
            "description": "Minimal API for checking the backend health status.",
        },
        {
            "name": "User",
            "description": "APIs for user validations.",
        },
        {
            "name": "Booking",
            "description": "APIs for booking validations.",
        },
        {
            "name": "Customer",
            "description": "APIs for customer validations.",
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(users_router)
app.include_router(bookings_router)
app.include_router(customer_router)