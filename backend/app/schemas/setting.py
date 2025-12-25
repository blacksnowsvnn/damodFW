from typing import Optional
from pydantic import BaseModel, Field, EmailStr

# Shared properties
class SettingBase(BaseModel):
    value: Optional[str] = None
    type: Optional[str] = "string"
    description: Optional[str] = None

# Properties to receive via API on creation
class SettingCreate(SettingBase):
    key: str
    value: str

# Properties to receive via API on update
class SettingUpdate(SettingBase):
    pass

class SettingInDBBase(SettingBase):
    key: str

    class Config:
        from_attributes = True

# Additional properties to return via API
class Setting(SettingInDBBase):
    pass

class DatabaseConfig(BaseModel):
    db_user: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$", description="Tên người dùng database")
    db_password: str = Field(..., min_length=6, description="Mật khẩu database")
    db_name: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$", description="Tên database")
    db_host: str = Field(default="db")
    db_port: str = Field(default="5432")
    create_new: Optional[bool] = False
    force_reset: Optional[bool] = False
    root_user: Optional[str] = "postgres"
    root_password: Optional[str] = Field(None, description="Mật khẩu root của PostgreSQL")

class DomainConfig(BaseModel):
    app_name: str = Field(..., min_length=2, description="Tên ứng dụng")
    domain: str = Field(..., min_length=3, description="Tên miền hoặc IP")

class PgAdminConfig(BaseModel):
    pgadmin_email: EmailStr = Field(..., description="Email đăng nhập pgAdmin")
    pgadmin_password: str = Field(..., min_length=6, description="Mật khẩu pgAdmin")

class InstallSetup(BaseModel):
    db_config: DatabaseConfig
    domain_config: DomainConfig
    pgadmin_config: PgAdminConfig
    admin_email: EmailStr = Field(..., description="Email quản trị viên")
    admin_password: str = Field(..., min_length=6, description="Mật khẩu quản trị viên")
    admin_full_name: str = Field(..., min_length=2, description="Họ tên quản trị viên")

