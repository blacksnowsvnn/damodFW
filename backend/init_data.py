from app.db.session import SessionLocal
from app import crud, schemas
from app.db.base import Base
from app.db.session import engine

def init_db():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

if __name__ == "__main__":
    init_db()
