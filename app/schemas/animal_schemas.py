from pydantic import BaseModel
from typing import Optional

class AnimalBase(BaseModel):
    caravana: str
    categoria: str
    raza: Optional[str] = None
    peso: Optional[float] = 0.0
    lote_id: Optional[int] = None

class AnimalCreate(AnimalBase):
    pass

class AnimalResponse(AnimalBase):
    id: int
    campo_id: int

    class Config:
        from_attributes = True