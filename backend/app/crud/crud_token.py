from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.token_blacklist import TokenBlacklist

class CRUDToken:
    def add_to_blacklist(
        self, db: Session, *, token: str, jti: str, expires_at: datetime
    ) -> TokenBlacklist:
        db_obj = TokenBlacklist(
            token=token,
            jti=jti,
            expires_at=expires_at
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def is_blacklisted(self, db: Session, *, jti: str) -> bool:
        return db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first() is not None

token = CRUDToken()
