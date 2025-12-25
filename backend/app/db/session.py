from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

try:
    engine = create_engine(settings.DATABASE_URL)
except Exception as e:
    print(f"Error creating engine: {e}")
    # Fallback engine to avoid crash
    engine = create_engine("sqlite:///:memory:") 

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    # Reload engine to catch new .env changes
    from app.core.config import settings
    temp_engine = create_engine(settings.DATABASE_URL)
    TempSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=temp_engine)
    db = TempSessionLocal()
    try:
        yield db
    finally:
        db.close()
        temp_engine.dispose()
