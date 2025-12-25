from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class Setting(Base):
    key = Column(String, primary_key=True, index=True, unique=True)
    value = Column(Text, nullable=True)
    type = Column(String, default="string") # string, boolean, number, json
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
