from fastapi import FastAPI
from api.users import users_router
from api.bookings import bookings_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Birthday Box API implementation",
    description="Birthday Box API implementation",)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(bookings_router)