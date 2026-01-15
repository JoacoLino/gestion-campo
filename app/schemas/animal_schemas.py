from pydantic import BaseModel
from typing import Optional
from datetime import date

class AnimalBase(BaseModel):
    caravana: str
    categoria: str
    raza: Optional[str] = None
    peso: Optional[float] = None
    lote_id: Optional[int] = None # Podemos crear una vaca sin asignarla a un lote aun

class AnimalCreate(AnimalBase):
    pass # Recibe todo lo de arriba

class AnimalOut(AnimalBase):
    id: int
    campo_id: int
    # fecha_nacimiento: Optional[date] # Si querés manejar fechas
    
    class Config:
        orm_mode = True