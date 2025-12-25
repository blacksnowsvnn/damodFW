from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
from app import crud, schemas, models
from app.api import deps
from app.utils.env_manager import set_env_value
from app.utils.nginx_manager import update_nginx_domain
from app.db.base import Base
from app.db.session import engine

router = APIRouter()

@router.get("/check", response_model=schemas.Msg)
def check_install_status() -> Any:
    """
    Kiểm tra xem hệ thống đã được cài đặt chưa.
    Hệ thống được coi là đã cài đặt nếu file .env tồn tại.
    """
    from pathlib import Path
    project_root = Path("/app/project")
    if project_root.exists():
        root_dir = project_root
    else:
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
    
    env_path = root_dir / ".env"
    
    if env_path.exists():
        return {"msg": "installed"}
    
    return {"msg": "not_installed"}

@router.post("/test-db")
def test_db_connection(config: schemas.setting.DatabaseConfig):
    """
    Kiểm tra kết nối tới Database với thông tin cung cấp.
    """
    db_url = f"postgresql://{config.db_user}:{config.db_password}@{config.db_host}:{config.db_port}/{config.db_name}"
    try:
        temp_engine = create_engine(db_url, connect_args={"connect_timeout": 5})
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"msg": "Kết nối thành công!"}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Kết nối thất bại: {str(e)}"
        )

@router.post("/setup", response_model=schemas.Msg)
def setup_system(
    *,
    setup_in: schemas.setting.InstallSetup,
) -> Any:
    """
    Khởi tạo hệ thống: Cập nhật .env, tạo bảng, tạo admin và config nginx.
    """
    # 1. Cập nhật file .env
    db_url = f"postgresql://{setup_in.db_config.db_user}:{setup_in.db_config.db_password}@{setup_in.db_config.db_host}:{setup_in.db_config.db_port}/{setup_in.db_config.db_name}"
    
    set_env_value("POSTGRES_USER", setup_in.db_config.db_user)
    set_env_value("POSTGRES_PASSWORD", setup_in.db_config.db_password)
    set_env_value("POSTGRES_DB", setup_in.db_config.db_name)
    set_env_value("POSTGRES_HOST", setup_in.db_config.db_host)
    set_env_value("POSTGRES_PORT", setup_in.db_config.db_port)
    set_env_value("DATABASE_URL", db_url)
    
    set_env_value("APP_NAME", setup_in.domain_config.app_name)
    set_env_value("DOMAIN", setup_in.domain_config.domain)
    set_env_value("NEXT_PUBLIC_APP_NAME", setup_in.domain_config.app_name)
    
    # 2. Cập nhật Nginx
    update_nginx_domain(setup_in.domain_config.domain)
    
    # 3. Khởi tạo database và session mới với cấu hình vừa nhận
    try:
        new_engine = create_engine(db_url)
        # Reset database: Xóa tất cả bảng cũ trước khi tạo mới
        Base.metadata.drop_all(bind=new_engine)
        Base.metadata.create_all(bind=new_engine)
        
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=new_engine)
        db = SessionLocal()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi khởi tạo database: {str(e)}")

    try:
        # 4. Kiểm tra xem đã có admin chưa (đề phòng chạy lại)
        admin_exists = db.query(models.Member).filter(models.Member.rank == 0).first()
        if not admin_exists:
            admin_in = schemas.MemberCreate(
                email=setup_in.admin_email,
                password=setup_in.admin_password,
                full_name=setup_in.admin_full_name,
                rank=0,
            )
            crud.member.create(db, obj_in=admin_in)
        
        # 5. Lưu cấu hình vào bảng setting
        settings_to_save = {
            "site_title": setup_in.domain_config.app_name,
            "system_installed": "true",
            "domain": setup_in.domain_config.domain
        }
        
        for key, value in settings_to_save.items():
            existing = crud.setting.get(db, key=key)
            if existing:
                crud.setting.update(db, db_obj=existing, obj_in={"value": value})
            else:
                crud.setting.create(db, obj_in=schemas.SettingCreate(
                    key=key,
                    value=value,
                    type="string",
                    description=f"Cấu hình {key}"
                ))
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu dữ liệu cài đặt: {str(e)}")
    finally:
        db.close()
        
    return {"msg": "Cài đặt hệ thống thành công! Hệ thống có thể cần khởi động lại để áp dụng hoàn toàn các thay đổi."}


