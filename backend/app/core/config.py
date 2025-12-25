import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "FastAPI Project"
    
    def _reload_env(self):
        from pathlib import Path
        project_root = Path("/app/project")
        if project_root.exists():
            env_path = project_root / ".env"
            load_dotenv(dotenv_path=env_path, override=True)
        else:
            load_dotenv(override=True)

    @property
    def DATABASE_URL(self) -> str:
        self._reload_env()
        url = os.getenv("DATABASE_URL")
        if not url:
            return "postgresql://user:pass@localhost:5432/db"
        return url

    @property
    def SECRET_KEY(self) -> str:
        self._reload_env()
        return os.getenv("SECRET_KEY", "your-secret-key-for-jwt-change-this-in-production")

    @property
    def BACKEND_CORS_ORIGINS(self) -> list[str]:
        self._reload_env()
        origins = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost,http://localhost:3000,http://localhost:8080")
        domain = os.getenv("DOMAIN")
        if domain and domain not in origins:
            origins += f",http://{domain},https://{domain}"
        return [origin.strip() for origin in origins.split(",")]

    API_V1_STR: str = "/api/v1"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

settings = Settings()
