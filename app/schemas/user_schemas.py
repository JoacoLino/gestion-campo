from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    name: str
    email: EmailStr

class UsuarioCreate(UsuarioBase):
    password: str
    plan: Optional[int] = 0

class UsuarioOut(UsuarioBase):
    id: int
    plan: int

    class Config:
        orm_mode = True
