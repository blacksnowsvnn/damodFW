from typing import Optional, List, Any, Dict, Union
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.member import Member
from app.schemas.member import MemberCreate, MemberUpdate

class CRUDMember:
    def get(self, db: Session, id: Any) -> Optional[Member]:
        return db.query(Member).filter(Member.id == id).first()

    def get_by_email(self, db: Session, *, email: str) -> Optional[Member]:
        return db.query(Member).filter(Member.email == email).first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Member]:
        return db.query(Member).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: MemberCreate) -> Member:
        db_obj = Member(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            rank=obj_in.rank,
            is_active=obj_in.is_active,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Member, obj_in: Union[MemberUpdate, Dict[str, Any]]
    ) -> Member:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Member:
        obj = db.query(Member).get(id)
        db.delete(obj)
        db.commit()
        return obj

member = CRUDMember()
