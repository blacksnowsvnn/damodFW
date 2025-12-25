import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

def sanitize_sql(sql: str) -> str:
    """
    Ẩn mật khẩu trong các câu lệnh SQL (ví dụ: CREATE USER ... WITH PASSWORD '...')
    """
    # Ẩn password trong câu lệnh SQL
    return re.sub(r"(PASSWORD\s+')[^']*(')", r"\1********\2", sql, flags=re.IGNORECASE)

def restart_container(container_name: str) -> bool:
    """
    Restart một container cụ thể bằng Docker SDK.
    Yêu cầu /var/run/docker.sock được mount vào container backend.
    """
    try:
        import docker
        client = docker.from_env()
        container = client.containers.get(container_name)
        container.restart()
        logger.info(f"Container '{container_name}' restarted successfully.")
        return True
    except Exception as e:
        logger.error(f"Failed to restart container '{container_name}': {str(e)}")
        return False

def update_pgadmin_user(email: str, password: str) -> bool:
    """
    Cập nhật hoặc tạo mới user trong pgAdmin bằng CLI của pgAdmin.
    Điều này giúp đồng bộ thông tin đăng nhập mà không cần xóa volume.
    """
    container_name = "pgadmin_panel"
    try:
        import docker
        client = docker.from_env()
        container = client.containers.get(container_name)
        
        # Thử cập nhật trước
        update_cmd = f"/venv/bin/python3 /pgadmin4/setup.py update-user {email} --password {password} --role Administrator"
        result = container.exec_run(update_cmd)
        output = result.output.decode()
        
        # pgAdmin setup.py trả về exit_code 0 ngay cả khi "User not found"
        if result.exit_code == 0 and "User not found" not in output:
            logger.info(f"pgAdmin user '{email}' updated successfully.")
            return True
            
        # Nếu cập nhật thất bại (user chưa tồn tại), thử tạo mới
        add_cmd = f"/venv/bin/python3 /pgadmin4/setup.py add-user {email} {password} --admin"
        result = container.exec_run(add_cmd)
        output = result.output.decode()
        
        if result.exit_code == 0:
            logger.info(f"pgAdmin user '{email}' created successfully.")
            return True
        
        logger.error(f"Failed to update or add pgAdmin user: {output}")
        return False
    except Exception as e:
        logger.error(f"Error updating pgAdmin user: {str(e)}")
        return False

def setup_pgadmin_servers(pgadmin_email: str, db_config: Any, app_name: str = "Damod DB") -> bool:
    """
    Tự động cấu hình các server trong pgAdmin để người dùng không phải nhập lại mật khẩu.
    Bao gồm cả App User và Root User.
    """
    container_name = "pgadmin_panel"
    import json
    
    # Đảm bảo host là 'db' khi chạy trong docker
    db_host = db_config.db_host
    if db_host == "localhost":
        db_host = "db"

    servers_config = {
        "Servers": {
            "1": {
                "Name": f"{app_name} (Database)", 
                "Group": "Servers",
                "Host": db_host,
                "Port": int(db_config.db_port),
                "MaintenanceDB": db_config.db_name, # Quan trọng: Phải là DB của app để user có quyền
                "Username": db_config.db_user,
                "SSLMode": "prefer",
                "Password": db_config.db_password,
                "SavePassword": True, # Đảm bảo pgAdmin lưu mật khẩu
                "Shared": True
            },
            "2": {
                "Name": f"{app_name} (Root Access)",
                "Group": "Servers",
                "Host": db_host,
                "Port": int(db_config.db_port),
                "MaintenanceDB": "postgres", # Root có quyền vào postgres
                "Username": db_config.root_user,
                "SSLMode": "prefer",
                "Password": db_config.root_password,
                "SavePassword": True,
                "Shared": True
            }
        }
    }
    
    try:
        import docker
        client = docker.from_env()
        container = client.containers.get(container_name)
        
        # 1. Tạo file servers.json và copy vào container
        import io
        import tarfile
        
        json_content = json.dumps(servers_config)
        
        # Tạo tar archive trong bộ nhớ
        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode='w') as tar:
            content_bytes = json_content.encode('utf-8')
            tarinfo = tarfile.TarInfo(name="servers.json")
            tarinfo.size = len(content_bytes)
            tar.addfile(tarinfo, io.BytesIO(content_bytes))
        
        tar_stream.seek(0)
        
        # Copy vào /tmp/ trong container
        container.put_archive("/tmp/", tar_stream)
        
        # 2. Load servers vào pgAdmin
        # Sử dụng --replace để cập nhật nếu đã tồn tại
        load_cmd = f"/venv/bin/python3 /pgadmin4/setup.py load-servers /tmp/servers.json --user {pgadmin_email} --replace"
        result = container.exec_run(load_cmd)
        
        if result.exit_code == 0:
            logger.info(f"pgAdmin servers loaded successfully for {pgadmin_email}.")
            # Xóa file tạm trong container
            container.exec_run("rm /tmp/servers.json")
            return True
        else:
            output = result.output.decode()
            logger.error(f"Failed to load pgAdmin servers for {pgadmin_email}: {output}")
            return False
            
    except Exception as e:
        logger.error(f"Error setting up pgAdmin servers: {str(e)}")
        return False

def exec_sql_in_container(container_name: str, sql: str, db_user: str = None, target_db: str = "postgres") -> bool:
    """
    Thực thi lệnh SQL trực tiếp bên trong container Postgres bằng psql.
    Cách này bỏ qua việc kiểm tra mật khẩu qua mạng.
    """
    try:
        import docker
        client = docker.from_env()
        container = client.containers.get(container_name)
        
        users_to_try = []
        if db_user:
            users_to_try.append(db_user)
        
        # Thử lấy từ env của container
        env_vars = container.attrs.get('Config', {}).get('Env', [])
        for env in env_vars:
            if env.startswith("POSTGRES_USER="):
                env_user = env.split("=")[1]
                if env_user not in users_to_try:
                    users_to_try.append(env_user)
                break
        
        # Thêm các user mặc định phổ biến
        for u in ["postgres", "root"]:
            if u not in users_to_try:
                users_to_try.append(u)

        sanitized_sql = sanitize_sql(sql)
        last_error = ""
        for user in users_to_try:
            # Thêm biến môi trường PGPASSWORD="" để tránh psql hỏi pass
            logger.info(f"Attempting SQL in {container_name} (DB: {target_db}) using user: {user}")
            cmd = f"psql -U {user} -d {target_db} -c \"{sql}\""
            result = container.exec_run(cmd)
            if result.exit_code == 0:
                logger.info(f"SQL executed successfully in {container_name} using user {user}")
                return True
            else:
                last_error = sanitize_sql(result.output.decode())
                logger.warning(f"SQL failed in {container_name} with user {user}: {last_error.strip()}")
        
        logger.error(f"SQL failed in {container_name} after trying users {users_to_try}. SQL: {sanitized_sql}")
        return False
    except Exception as e:
        logger.error(f"Failed to exec SQL in container: {str(e)}")
        return False
