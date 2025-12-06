from pydantic import BaseModel
from datetime import datetime

class RefreshTokenOut(BaseModel):
    id: int
    token: str
    user_id: int
    created_at: datetime
    expires_at: datetime
    is_active: bool

    class Config:
        orm_mode = True
