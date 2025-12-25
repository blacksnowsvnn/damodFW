from pydantic import BaseModel, Field

class Msg(BaseModel):
    msg: str = Field(..., description="Thông báo phản hồi từ hệ thống")
