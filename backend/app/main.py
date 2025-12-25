from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Create tables (Optional at startup, will be handled by install module if DB is not ready)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Skipping table creation at startup: {e}")

app = FastAPI(
    title="Damod Project API",
    description="",
    version="1.0.0",
    root_path="/backend"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
