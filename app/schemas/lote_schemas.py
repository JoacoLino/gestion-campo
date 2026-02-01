from pydantic import BaseModel
from typing import Optional, List

# Base: Datos comunes al crear y al leer
class LoteBase(BaseModel):
    name: str
    superficie: float
    cultivo: Optional[str] = None

# Create: Lo que recibes del Frontend
class LoteCreate(LoteBase):
    pass

# Out: Lo que devuelves al Frontend (incluye ID)
class LoteOut(LoteBase):
    id: int
    campo_id: int
    cantidad_animales: int = 0

    class Config:
        orm_mode = True