from typing import Optional
from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str = Field(..., description="Mã truy cập JWT")
    token_type: str = Field(..., description="Loại token (thường là bearer)")

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    jti: Optional[str] = None
    exp: Optional[int] = None
