from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from pathlib import Path
import uuid
from typing import List

router = APIRouter()

# Khởi tạo giá trị mặc định, nhưng logic xác định đường dẫn thực tế sẽ nằm trong hàm
DEFAULT_UPLOAD_PATH = Path("/app/uploads")

def get_upload_dir() -> Path:
    """
    Xác định thư mục upload hợp lệ (Docker hoặc Local) và tạo nếu chưa tồn tại.
    """
    # 1. Ưu tiên đường dẫn Docker volume
    if DEFAULT_UPLOAD_PATH.exists():
        return DEFAULT_UPLOAD_PATH
    
    # 2. Nếu không tồn tại (chạy local hoặc chưa mount), thử tạo
    try:
        os.makedirs(DEFAULT_UPLOAD_PATH, exist_ok=True)
        return DEFAULT_UPLOAD_PATH
    except Exception:
        # 3. Nếu không thể tạo (do permission), fallback về thư mục local tương đối
        local_path = Path("uploads")
        os.makedirs(local_path, exist_ok=True)
        return local_path

@router.post("/", response_model=dict)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file.
    Returns the relative URL to access the file.
    """
    upload_dir = get_upload_dir()

    # Validate file type (basic check)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_dir / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    return {"url": f"/uploads/{unique_filename}"}
