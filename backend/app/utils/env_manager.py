import os
from pathlib import Path

def set_env_value(key: str, value: str, env_path: str = ".env"):
    """
    Cập nhật hoặc thêm một biến môi trường vào file .env.
    """
    # Trong môi trường Docker, root_dir là /app/project nếu được mount
    project_root = Path("/app/project")
    if project_root.exists():
        root_dir = project_root
    else:
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
    
    full_path = root_dir / env_path
    
    if not full_path.exists():
        with open(full_path, "w") as f:
            f.write(f"{key}={value}\n")
        return

    lines = []
    found = False
    with open(full_path, "r") as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[i] = f"{key}={value}\n"
            found = True
            break
    
    if not found:
        # Nếu không thấy key, thêm vào cuối file
        if lines and not lines[-1].endswith("\n"):
            lines.append("\n")
        lines.append(f"{key}={value}\n")

    with open(full_path, "w") as f:
        f.writelines(lines)

def get_env_value(key: str, default: str = None, env_path: str = ".env"):
    """
    Lấy giá trị của một biến môi trường từ file .env.
    """
    project_root = Path("/app/project")
    if project_root.exists():
        root_dir = project_root
    else:
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
    
    full_path = root_dir / env_path
    
    if not full_path.exists():
        return default

    with open(full_path, "r") as f:
        for line in f:
            if line.startswith(f"{key}="):
                return line.split("=", 1)[1].strip()
    
    return default
