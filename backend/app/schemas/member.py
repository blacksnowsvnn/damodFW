from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# Shared properties
class MemberBase(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Địa chỉ email của thành viên")
    full_name: Optional[str] = Field(None, description="Họ và tên")
    is_active: Optional[bool] = Field(True, description="Trạng thái hoạt động")
    rank: Optional[int] = Field(default=5, ge=0, le=5, description="Cấp bậc (0: Admin, 1-5: Member)")

# Properties to receive via API on creation
class MemberCreate(MemberBase):
    email: EmailStr
    password: str

# Properties to receive via API on update
class MemberUpdate(MemberBase):
    password: Optional[str] = None

class MemberInDBBase(MemberBase):
    id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

# Additional properties to return via API
class Member(MemberInDBBase):
    pass

# Additional properties stored in DB
class MemberInDB(MemberInDBBase):
    hashed_password: str
