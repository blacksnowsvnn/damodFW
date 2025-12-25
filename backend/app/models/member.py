from sqlalchemy import Column, Integer, String, Boolean
from app.db.base_class import Base, TimestampMixin

class Member(Base, TimestampMixin):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    rank = Column(Integer, default=5)  # 0: Admin, 1-5: Members (lower is higher rank)
