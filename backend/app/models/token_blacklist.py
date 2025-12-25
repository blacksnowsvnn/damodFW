from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.db.base_class import Base

class TokenBlacklist(Base):
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    jti = Column(String, index=True, nullable=True) # JWT ID
    blacklisted_on = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
