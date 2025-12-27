from fastapi import APIRouter
from app.api.api_v1.endpoints import members, auth, install, settings, upload

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(install.router, prefix="/install", tags=["install"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
