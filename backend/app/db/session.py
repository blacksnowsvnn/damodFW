from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Cấu hình engine với connection pool tối ưu
engine = create_engine(
    settings.get_database_url(),
    pool_pre_ping=True,  # Kiểm tra kết nối trước khi sử dụng để tránh lỗi "connection closed"
    pool_size=10,        # Số lượng kết nối duy trì trong pool
    max_overflow=20,     # Số lượng kết nối tối đa có thể vượt mức pool_size
    pool_recycle=3600,   # Tự động đóng kết nối sau 1 giờ để tránh bị DB server ngắt
)

# Khởi tạo session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency function để lấy database session cho mỗi request.
    Đảm bảo session được đóng sau khi request kết thúc.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
