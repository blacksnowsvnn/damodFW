from datetime import timedelta, datetime, timezone
from typing import Any
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core import auth
from app.core.config import settings
from app.core.security import verify_password

router = APIRouter()

@router.post("/logout", response_model=schemas.Msg)
def logout(
    db: Session = Depends(deps.get_db),
    token: str = Depends(deps.reusable_oauth2),
    current_user: models.Member = Depends(deps.get_current_user)
) -> Any:
    """
    Đăng xuất: Vô hiệu hóa token hiện tại bằng cách thêm vào blacklist.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
        
        if token_data.jti:
            # Chuyển exp (timestamp) sang datetime
            expires_at = datetime.fromtimestamp(token_data.exp, tz=timezone.utc)
            crud.token.add_to_blacklist(
                db, token=token, jti=token_data.jti, expires_at=expires_at
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token không hợp lệ",
        )
    
    return {"msg": "Đăng xuất thành công"}

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Đăng nhập bằng email và mật khẩu để lấy Access Token (Chuẩn OAuth2).
    """
    user = crud.member.get_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc mật khẩu không chính xác",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Tài khoản đã bị vô hiệu hóa"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": auth.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=schemas.Member)
def register_member(
    *,
    db: Session = Depends(deps.get_db),
    member_in: schemas.MemberCreate,
) -> Any:
    """
    Đăng ký thành viên mới (Công khai).
    Cấp bậc mặc định là 5 (Thấp nhất).
    """
    user = crud.member.get_by_email(db, email=member_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    # Ghi đè rank để đảm bảo luôn là 5 khi đăng ký công khai
    member_in.rank = 5
    return crud.member.create(db, obj_in=member_in)

@router.post("/password-recovery/{email}", response_model=schemas.Msg)
def recover_password(email: str, db: Session = Depends(deps.get_db)) -> Any:
    """
    Khôi phục mật khẩu (Quên mật khẩu).
    Hiện tại chỉ trả về thông báo thành công.
    Cần tích hợp dịch vụ Email (SMTP/SendGrid) để gửi email thực tế.
    """
    user = crud.member.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Người dùng với email này không tồn tại trong hệ thống.",
        )
    # TODO: Tạo token reset và gửi email
    return {"msg": f"Email khôi phục mật khẩu đã được gửi tới {email}"}
