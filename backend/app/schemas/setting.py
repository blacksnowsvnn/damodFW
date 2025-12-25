from typing import Optional
from pydantic import BaseModel

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
    db_user: str
    db_password: str
    db_name: str
    db_host: str
    db_port: str

class DomainConfig(BaseModel):
    app_name: str
    domain: str

class InstallSetup(BaseModel):
    db_config: DatabaseConfig
    domain_config: DomainConfig
    admin_email: str
    admin_password: str
    admin_full_name: str

