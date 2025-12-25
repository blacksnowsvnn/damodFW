from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.api import deps

router = APIRouter()

@router.get("/check", response_model=schemas.Msg)
def check_install_status(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Kiểm tra xem hệ thống đã được cài đặt chưa.
    """
    # Kiểm tra xem có admin nào chưa
    admin_exists = db.query(models.Member).filter(models.Member.rank == 0).first()
    # Kiểm tra cấu hình system_installed
    installed_setting = crud.setting.get(db, key="system_installed")
    
    if admin_exists and installed_setting and installed_setting.value == "true":
        return {"msg": "installed"}
    return {"msg": "not_installed"}

@router.post("/setup", response_model=schemas.Msg)
def setup_system(
    *,
    db: Session = Depends(deps.get_db),
    setup_in: schemas.setting.InstallSetup,
) -> Any:
    """
    Khởi tạo hệ thống: Tạo tài khoản admin và lưu cấu hình cơ bản.
    """
    # 1. Kiểm tra xem đã cài đặt chưa
    admin_exists = db.query(models.Member).filter(models.Member.rank == 0).first()
    installed_setting = crud.setting.get(db, key="system_installed")
    
    if admin_exists and installed_setting and installed_setting.value == "true":
        raise HTTPException(
            status_code=400,
            detail="Hệ thống đã được cài đặt rồi.",
        )
    
    # 2. Tạo tài khoản admin
    admin_in = schemas.MemberCreate(
        email=setup_in.admin_email,
        password=setup_in.admin_password,
        full_name=setup_in.admin_full_name,
        rank=0,
    )
    crud.member.create(db, obj_in=admin_in)
    
    # 3. Lưu cấu hình site_title
    site_title_setting = crud.setting.get(db, key="site_title")
    if site_title_setting:
        crud.setting.update(db, db_obj=site_title_setting, obj_in={"value": setup_in.site_title})
    else:
        crud.setting.create(db, obj_in=schemas.SettingCreate(
            key="site_title",
            value=setup_in.site_title,
            type="string",
            description="Tên của website"
        ))
        
    # 4. Đánh dấu đã cài đặt
    if installed_setting:
        crud.setting.update(db, db_obj=installed_setting, obj_in={"value": "true"})
    else:
        crud.setting.create(db, obj_in=schemas.SettingCreate(
            key="system_installed",
            value="true",
            type="boolean",
            description="Trạng thái cài đặt hệ thống"
        ))
        
    return {"msg": "Cài đặt hệ thống thành công!"}
