from fastapi import APIRouter



health_router = APIRouter(prefix="/health", tags=["Health"])


@health_router.get(
    "/",
)
async def get_root() -> str:
    """Show welcome message"""
    return "Welcome to the birthdax box backend API."



