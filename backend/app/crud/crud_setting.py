from typing import Optional, List, Any, Dict, Union
from sqlalchemy.orm import Session
from app.models.setting import Setting
from app.schemas.setting import SettingCreate, SettingUpdate

class CRUDSetting:
    def get(self, db: Session, key: str) -> Optional[Setting]:
        return db.query(Setting).filter(Setting.key == key).first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Setting]:
        return db.query(Setting).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: SettingCreate) -> Setting:
        db_obj = Setting(
            key=obj_in.key,
            value=obj_in.value,
            type=obj_in.type,
            description=obj_in.description,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Setting, obj_in: Union[SettingUpdate, Dict[str, Any]]
    ) -> Setting:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, key: str) -> Setting:
        obj = db.query(Setting).get(key)
        db.delete(obj)
        db.commit()
        return obj

setting = CRUDSetting()
