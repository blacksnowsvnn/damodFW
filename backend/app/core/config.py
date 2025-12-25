from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "/app/project/.env"),
        env_file_encoding='utf-8',
        extra='ignore'
    )

    PROJECT_NAME: str = "FastAPI Project"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-for-jwt-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database configurations
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "pass"
    POSTGRES_DB: str = "db"
    
    DATABASE_URL: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str | None, info) -> str:
        if isinstance(v, str) and v:
            return v
        return ""

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    DOMAIN: str = "localhost"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost", "http://localhost:3000", "http://localhost:8080"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    def get_cors_origins(self) -> List[str]:
        origins = list(self.BACKEND_CORS_ORIGINS)
        if self.DOMAIN and self.DOMAIN not in [o.replace("http://", "").replace("https://", "") for o in origins]:
            origins.append(f"http://{self.DOMAIN}")
            origins.append(f"https://{self.DOMAIN}")
        return origins

settings = Settings()
