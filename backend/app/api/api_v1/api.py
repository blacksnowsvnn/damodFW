from fastapi import APIRouter
from app.api.api_v1.endpoints import members, auth, install

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(install.router, prefix="/install", tags=["install"])
