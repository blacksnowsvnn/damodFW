from sqlalchemy import Column, String, Text
from app.db.base_class import Base, TimestampMixin

class Setting(Base, TimestampMixin):
    key = Column(String, primary_key=True, index=True, unique=True)
    value = Column(Text, nullable=True)
    type = Column(String, default="string") # string, boolean, number, json
    description = Column(String, nullable=True)
