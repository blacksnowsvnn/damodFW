from sqlalchemy import Column, Integer, String, DateTime
from app.db.base_class import Base

class TokenBlacklist(Base):
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    jti = Column(String, index=True, nullable=True) # JWT ID
    blacklisted_on = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
