from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func

@as_declarative()
class Base:
    id: Any
    __name__: str

    # Tự động tạo tên bảng từ tên Class (chuyển sang chữ thường)
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

class TimestampMixin:
    """
    Mixin để tự động thêm cột created_at và updated_at cho các models.
    """
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)
