from typing import Any
from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
from app import crud, schemas, models
from app.utils.env_manager import set_env_value
from app.utils.nginx_manager import update_nginx_domain
from app.utils.docker_manager import restart_container, exec_sql_in_container, update_pgadmin_user, setup_pgadmin_servers
from app.db.base import Base
import logging

logger = logging.getLogger(__name__)

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
    Nếu create_new=True, kiểm tra kết nối bằng quyền Root.
    """
    # Nếu hệ thống đã cài đặt, không cho phép test-db nữa trừ khi có admin token (tùy chọn bảo mật)
    # Tuy nhiên để đơn giản, ta chỉ kiểm tra check_install_status() bên trong setup
    
    if config.create_new:
        db_url = f"postgresql://{config.root_user}:{config.root_password}@{config.db_host}:{config.db_port}/postgres"
        success_msg = "Kết nối Root thành công! Bạn có thể tạo Database mới."
    else:
        db_url = f"postgresql://{config.db_user}:{config.db_password}@{config.db_host}:{config.db_port}/{config.db_name}"
        success_msg = "Kết nối Database thành công!"
        
    try:
        temp_engine = create_engine(db_url, connect_args={"connect_timeout": 5})
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"msg": success_msg}
    except Exception as e:
        logger.error(f"DB Connection test failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Kết nối thất bại. Vui lòng kiểm tra lại thông tin cấu hình."
        )

@router.post("/setup", response_model=schemas.Msg)
def setup_system(
    *,
    setup_in: schemas.setting.InstallSetup,
) -> Any:
    """
    Khởi tạo hệ thống: Cập nhật .env, tạo bảng, tạo admin và config nginx.
    """
    # 0. Kiểm tra xem hệ thống đã cài đặt chưa
    from app import crud
    from pathlib import Path
    
    # Ưu tiên kiểm tra file .env trước
    project_root = Path("/app/project")
    if project_root.exists():
        root_dir = project_root
    else:
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
    
    env_path = root_dir / ".env"
    
    # Nếu file .env KHÔNG tồn tại, cho phép setup bất kể DB có gì
    if env_path.exists():
        db = None
        try:
            from app.db.session import SessionLocal
            db = SessionLocal()
            installed_setting = crud.setting.get(db, key="system_installed")
            if installed_setting and installed_setting.value == "true":
                raise HTTPException(
                    status_code=400,
                    detail="Hệ thống đã được cài đặt. Không thể thực hiện lại quá trình setup."
                )
        except HTTPException:
            raise
        except Exception:
            # Nếu không kết nối được DB hoặc lỗi bảng setting, cứ cho phép tiếp tục setup
            pass
        finally:
            if db:
                db.close()

    # 0. Tạo Database và User nếu yêu cầu
    if setup_in.db_config.create_new:
        root_url = f"postgresql://{setup_in.db_config.root_user}:{setup_in.db_config.root_password}@{setup_in.db_config.db_host}:{setup_in.db_config.db_port}/postgres"
        try:
            # A. THỬ KẾT NỐI QUA MẠNG TRƯỚC (Standard)
            root_engine = create_engine(root_url, isolation_level="AUTOCOMMIT")
            with root_engine.connect() as conn:
                # Nếu force_reset=True, xóa DB và User cũ trước khi tạo mới
                if setup_in.db_config.force_reset:
                    conn.execute(text(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{setup_in.db_config.db_name}' AND pid <> pg_backend_pid();"))
                    conn.execute(text(f"DROP DATABASE IF EXISTS {setup_in.db_config.db_name}"))
                    try:
                        conn.execute(text(f"DROP USER IF EXISTS {setup_in.db_config.db_user}"))
                    except Exception: pass
                
                # Tạo User
                user_exists = conn.execute(text(f"SELECT 1 FROM pg_roles WHERE rolname = '{setup_in.db_config.db_user}'")).fetchone()
                if not user_exists:
                    conn.execute(text(f"CREATE USER {setup_in.db_config.db_user} WITH PASSWORD '{setup_in.db_config.db_password}'"))
                else:
                    conn.execute(text(f"ALTER USER {setup_in.db_config.db_user} WITH PASSWORD '{setup_in.db_config.db_password}'"))
                
                # Tạo Database
                db_exists = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{setup_in.db_config.db_name}'")).fetchone()
                if not db_exists:
                    conn.execute(text(f"CREATE DATABASE {setup_in.db_config.db_name} OWNER {setup_in.db_config.db_user}"))
                conn.execute(text(f"GRANT ALL PRIVILEGES ON DATABASE {setup_in.db_config.db_name} TO {setup_in.db_config.db_user}"))

        except Exception as e:
            # B. NẾU THẤT BẠI (Do sai pass root), SỬ DỤNG DOCKER EXEC ĐỂ FORCE RESET
            # Đây là "cứu cánh" cuối cùng khi user/pass root không đúng
            logger.warning("Standard connection failed (possibly invalid root credentials). Attempting Force Reset via Docker Exec...")
            
            container_name = "postgres_db" # Tên container từ docker-compose
            root_user = setup_in.db_config.root_user
            
            if setup_in.db_config.force_reset:
                # Ngắt kết nối và xóa DB/User
                exec_sql_in_container(container_name, f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{setup_in.db_config.db_name}' AND pid <> pg_backend_pid();", root_user)
                exec_sql_in_container(container_name, f"DROP DATABASE IF EXISTS {setup_in.db_config.db_name};", root_user)
                exec_sql_in_container(container_name, f"DROP USER IF EXISTS {setup_in.db_config.db_user};", root_user)
            
            # Tạo User và Pass mới
            create_user_sql = f"DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '{setup_in.db_config.db_user}') THEN CREATE USER {setup_in.db_config.db_user} WITH PASSWORD '{setup_in.db_config.db_password}'; ELSE ALTER USER {setup_in.db_config.db_user} WITH PASSWORD '{setup_in.db_config.db_password}'; END IF; END $$;"
            if not exec_sql_in_container(container_name, create_user_sql, root_user):
                raise HTTPException(status_code=500, detail="Không thể tạo hoặc cập nhật Database User qua Docker Exec.")
            
            # Tạo Database
            # Ta dùng lệnh CREATE DATABASE trực tiếp. Nếu đã tồn tại, lệnh sẽ trả về lỗi, 
            # nhưng ta đã có log info ở dưới nên không cần raise ở đây.
            create_db_sql = f"CREATE DATABASE {setup_in.db_config.db_name} OWNER {setup_in.db_config.db_user};"
            exec_sql_in_container(container_name, create_db_sql, root_user)
            
            # Cấp quyền
            exec_sql_in_container(container_name, f"GRANT ALL PRIVILEGES ON DATABASE {setup_in.db_config.db_name} TO {setup_in.db_config.db_user};", root_user)
            
            # Cấp quyền trên schema public (Cần thiết cho Postgres 15+)
            # Phải kết nối trực tiếp vào database mới cấp được quyền schema
            exec_sql_in_container(container_name, f"GRANT ALL ON SCHEMA public TO {setup_in.db_config.db_user};", root_user, target_db=setup_in.db_config.db_name)
            exec_sql_in_container(container_name, f"ALTER SCHEMA public OWNER TO {setup_in.db_config.db_user};", root_user, target_db=setup_in.db_config.db_name)
            
            # Đảm bảo user có quyền trên tất cả các bảng hiện có (nếu có)
            exec_sql_in_container(container_name, f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {setup_in.db_config.db_user};", root_user, target_db=setup_in.db_config.db_name)
            exec_sql_in_container(container_name, f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {setup_in.db_config.db_user};", root_user, target_db=setup_in.db_config.db_name)

    # 1. Chuẩn bị URL database
    # Đảm bảo DATABASE_URL luôn trỏ tới host 'db' khi chạy trong docker
    db_host_for_url = setup_in.db_config.db_host
    if db_host_for_url == "localhost":
        db_host_for_url = "db"
        
    db_url = f"postgresql://{setup_in.db_config.db_user}:{setup_in.db_config.db_password}@{db_host_for_url}:{setup_in.db_config.db_port}/{setup_in.db_config.db_name}"
    
    # 2. Khởi tạo database và session mới với cấu hình vừa nhận
    try:
        new_engine = create_engine(db_url)
        # 3. Tạo bảng
        # Nếu force_reset=True, xóa các bảng hiện tại
        if setup_in.db_config.force_reset:
            Base.metadata.drop_all(bind=new_engine)
            
        Base.metadata.create_all(bind=new_engine)
        
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=new_engine)
        db = SessionLocal()
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi khi khởi tạo database. Vui lòng kiểm tra logs server.")

    try:
        # 4. Kiểm tra và cập nhật tài khoản admin
        admin_exists = db.query(models.Member).filter(models.Member.rank == 0).first()
        if not admin_exists:
            admin_in = schemas.MemberCreate(
                email=setup_in.admin_email,
                password=setup_in.admin_password,
                full_name=setup_in.admin_full_name,
                rank=0,
            )
            crud.member.create(db, obj_in=admin_in)
        else:
            # Cập nhật thông tin admin nếu đã tồn tại
            crud.member.update(db, db_obj=admin_exists, obj_in={
                "email": setup_in.admin_email,
                "password": setup_in.admin_password,
                "full_name": setup_in.admin_full_name
            })
        
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
        logger.error(f"Setup data save error: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi khi lưu dữ liệu cài đặt. Vui lòng kiểm tra logs server.")
    finally:
        db.close()

    # --- CHỈ KHI ĐẾN ĐÂY (DB ĐÃ XONG) MỚI GHI FILE .env VÀ CẤU HÌNH HỆ THỐNG ---
    
    # 6. Cập nhật file .env
    set_env_value("POSTGRES_USER", setup_in.db_config.db_user)
    set_env_value("POSTGRES_PASSWORD", setup_in.db_config.db_password)
    set_env_value("POSTGRES_DB", setup_in.db_config.db_name)
    set_env_value("POSTGRES_HOST", db_host_for_url)
    set_env_value("POSTGRES_PORT", setup_in.db_config.db_port)
    set_env_value("DATABASE_URL", db_url)
    
    set_env_value("APP_NAME", setup_in.domain_config.app_name)
    set_env_value("DOMAIN", setup_in.domain_config.domain)
    set_env_value("NEXT_PUBLIC_APP_NAME", setup_in.domain_config.app_name)
    
    # Cấu hình pgAdmin
    set_env_value("PGADMIN_DEFAULT_EMAIL", setup_in.pgadmin_config.pgadmin_email)
    set_env_value("PGADMIN_DEFAULT_PASSWORD", setup_in.pgadmin_config.pgadmin_password)
    
    # 7. Cập nhật Nginx
    update_nginx_domain(setup_in.domain_config.domain)
        
    # 8. Cập nhật user pgAdmin, cấu hình server và restart để áp dụng cấu hình mới
    update_pgadmin_user(setup_in.pgadmin_config.pgadmin_email, setup_in.pgadmin_config.pgadmin_password)
    
    # Đợi một chút để pgAdmin cập nhật database nội bộ
    import time
    time.sleep(2)
    
    setup_pgadmin_servers(
        setup_in.pgadmin_config.pgadmin_email,
        setup_in.db_config,
        setup_in.domain_config.app_name
    )
    restart_container("pgadmin_panel")
        
    return {"msg": "Cài đặt hệ thống thành công! Hệ thống có thể cần khởi động lại để áp dụng hoàn toàn các thay đổi."}


