from typing import Generator, Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from pydantic import ValidationError

from app.db.session import SessionLocal
from app.models.member import Member
from app.core.config import settings
from app import schemas, crud

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator:
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Member:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    # Kiểm tra token trong blacklist
    if token_data.jti and crud.token.is_blacklisted(db, jti=token_data.jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been blacklisted",
        )

    user = crud.member.get(db, id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def check_rank(required_rank: int):
    def rank_checker(current_user: Member = Depends(get_current_user)):
        # Rank 0 is Admin (can do anything)
        # Otherwise, rank must be less than or equal to required (lower number = higher rank)
        if current_user.rank != 0 and current_user.rank > required_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"The user doesn't have enough privileges. Required rank: {required_rank}",
            )
        return current_user
    return rank_checker

def check_admin(current_user: Member = Depends(get_current_user)):
    if current_user.rank != 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This operation requires Admin privileges (Rank 0)",
        )
    return current_user
