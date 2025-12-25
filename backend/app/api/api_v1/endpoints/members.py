from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.member.Member])
def read_members(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.check_admin),
) -> Any:
    """
    Danh sách thành viên (Chỉ dành cho Admin).
    """
    members = crud.member.get_multi(db, skip=skip, limit=limit)
    return members

@router.post("/", response_model=schemas.member.Member)
def create_member(
    *,
    db: Session = Depends(deps.get_db),
    member_in: schemas.member.MemberCreate,
    current_user: schemas.member.Member = Depends(deps.check_admin),
) -> Any:
    """
    Tạo thành viên mới (Chỉ dành cho Admin).
    """
    member = crud.member.get_by_email(db, email=member_in.email)
    if member:
        raise HTTPException(
            status_code=400,
            detail="Thành viên với email này đã tồn tại trong hệ thống.",
        )
    return crud.member.create(db, obj_in=member_in)

@router.get("/me", response_model=schemas.member.Member)
def read_member_me(
    current_user: schemas.member.Member = Depends(deps.get_current_user),
) -> Any:
    """
    Lấy thông tin thành viên hiện tại đang đăng nhập.
    """
    return current_user

@router.get("/{member_id}", response_model=schemas.member.Member)
def read_member_by_id(
    member_id: int,
    db: Session = Depends(deps.get_db),
    current_user: schemas.member.Member = Depends(deps.get_current_user),
) -> Any:
    """
    Lấy thông tin chi tiết thành viên theo ID.
    Thành viên chỉ có thể xem hồ sơ của chính mình. Admin có thể xem tất cả.
    """
    if current_user.rank != 0 and current_user.id != member_id:
        raise HTTPException(
            status_code=403,
            detail="You don't have enough privileges to view other members' profiles.",
        )
    member = crud.member.get(db, id=member_id)
    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )
    return member

@router.put("/{member_id}", response_model=schemas.member.Member)
def update_member(
    *,
    db: Session = Depends(deps.get_db),
    member_id: int,
    member_in: schemas.member.MemberUpdate,
    current_user: schemas.member.Member = Depends(deps.get_current_user),
) -> Any:
    """
    Cập nhật thông tin thành viên.
    Thành viên chỉ có thể cập nhật hồ sơ của chính mình. Admin có thể cập nhật tất cả.
    Admin có quyền thay đổi Rank. Thành viên thường không thể tự đổi Rank của mình.
    """
    member = crud.member.get(db, id=member_id)
    if not member:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy thành viên",
        )
    
    # Kiểm tra quyền hạn
    if current_user.rank != 0:
        if current_user.id != member_id:
            raise HTTPException(
                status_code=403,
                detail="Bạn không có đủ quyền để cập nhật hồ sơ của thành viên khác.",
            )
        # Ngăn người dùng thường tự thay đổi Rank của chính mình
        if member_in.rank is not None and member_in.rank != member.rank:
            raise HTTPException(
                status_code=403,
                detail="Bạn không có đủ quyền để thay đổi cấp bậc (Rank) của mình.",
            )

    return crud.member.update(db, db_obj=member, obj_in=member_in)

@router.delete("/{member_id}", response_model=schemas.member.Member)
def delete_member(
    *,
    db: Session = Depends(deps.get_db),
    member_id: int,
    current_user: schemas.member.Member = Depends(deps.check_admin),
) -> Any:
    """
    Xóa thành viên (Chỉ dành cho Admin).
    """
    member = crud.member.get(db, id=member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return crud.member.remove(db, id=member_id)
