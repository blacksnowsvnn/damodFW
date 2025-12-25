from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Damod Project API",
    description="""

    """,
    version="1.0.0",
    root_path="/backend"
)

app.include_router(api_router, prefix=settings.API_V1_STR)
