from pydantic import BaseModel
from typing import Optional

class InsumoBase(BaseModel):
    nombre: str
    categoria: str
    stock: float
    unidad: str
    costo_promedio: Optional[float] = 0.0

class InsumoCreate(InsumoBase):
    pass

class InsumoOut(InsumoBase):
    id: int
    campo_id: int

    class Config:
        from_attributes = True