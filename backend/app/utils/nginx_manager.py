import os
from pathlib import Path
from pydantic import validate_call

@validate_call
def update_nginx_domain(domain: str, nginx_conf_path: str = "nginx/default.conf"):
    """
    Cập nhật server_name trong file cấu hình Nginx.
    """
    project_root = Path("/app/project")
    if project_root.exists():
        root_dir = project_root
    else:
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
    
    full_path = root_dir / nginx_conf_path
    
    if not full_path.exists():
        return False

    lines = []
    with open(full_path, "r") as f:
        lines = f.readlines()

    updated = False
    for i, line in enumerate(lines):
        if "server_name" in line and ";" in line:
            # Giữ nguyên thụt lề và thêm localhost làm dự phòng
            indent = line[:line.find("server_name")]
            # Nếu domain là localhost thì chỉ để localhost, ngược lại thì thêm cả hai
            if domain == "localhost" or domain == "127.0.0.1":
                lines[i] = f"{indent}server_name localhost;\n"
            else:
                lines[i] = f"{indent}server_name {domain} localhost;\n"
            updated = True
            break
    
    if updated:
        with open(full_path, "w") as f:
            f.writelines(lines)
        return True
    
    return False
