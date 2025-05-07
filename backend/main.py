from fastapi import FastAPI
from api.users import users_router

app = FastAPI(title="Birthday Box API implementation",
    description="Birthday Box API implementation",)



app.include_router(users_router)
