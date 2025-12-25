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

class InstallSetup(BaseModel):
    admin_email: str
    admin_password: str
    admin_full_name: str
    site_title: str
