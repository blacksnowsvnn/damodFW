from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

# Danh sách các key được phép truy cập công khai
PUBLIC_SETTING_KEYS = [
    "site_title",
    "site_description",
    "site_keywords",
    "og_image",
    "theme_primary_color",
    "theme_radius",
    "theme_base_style",
    "header_scripts",
    "body_scripts",
]

@router.get("/public", response_model=Dict[str, Any])
def read_settings_public(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Lấy các cấu hình công khai (SEO, Theme, Scripts).
    """
    all_settings = crud.setting.get_multi(db)
    public_settings = {
        s.key: s.value for s in all_settings if s.key in PUBLIC_SETTING_KEYS
    }
    return public_settings

@router.get("/", response_model=List[schemas.Setting])
def read_settings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.Member = Depends(deps.check_admin),
) -> Any:
    """
    Lấy tất cả cấu hình (Chỉ dành cho Admin).
    """
    settings = crud.setting.get_multi(db, skip=skip, limit=limit)
    return settings

@router.put("/bulk", response_model=schemas.Msg)
def update_settings_bulk(
    *,
    db: Session = Depends(deps.get_db),
    obj_in: schemas.SettingBulkUpdate,
    current_user: models.Member = Depends(deps.check_admin),
) -> Any:
    """
    Cập nhật nhiều cấu hình cùng lúc (Chỉ dành cho Admin).
    """
    for key, value in obj_in.settings.items():
        existing_setting = crud.setting.get(db, key=key)
        if existing_setting:
            crud.setting.update(db, db_obj=existing_setting, obj_in={"value": value})
        else:
            crud.setting.create(db, obj_in=schemas.SettingCreate(
                key=key,
                value=value,
                type="string"
            ))
    
    return {"msg": "Cập nhật cấu hình thành công"}

@router.get("/{key}", response_model=schemas.Setting)
def read_setting_by_key(
    key: str,
    db: Session = Depends(deps.get_db),
    current_user: models.Member = Depends(deps.check_admin),
) -> Any:
    """
    Lấy cấu hình theo key (Chỉ dành cho Admin).
    """
    setting = crud.setting.get(db, key=key)
    if not setting:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    return setting
