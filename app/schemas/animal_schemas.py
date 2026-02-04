from pydantic import BaseModel
from typing import Optional, List

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

class MovimientoMasivo(BaseModel):
    animal_ids: List[int]
    nuevo_lote_id: Optional[int] # Puede ser None si los sacas del lote (a "Campo General")