from pydantic import BaseModel
from datetime import date
from typing import Optional

class EventoBase(BaseModel):
    title: str
    fecha: date
    tipo: str
    descripcion: Optional[str] = None
    completado: bool = False

class EventoCreate(EventoBase):
    pass

class EventoOut(EventoBase):
    id: int
    campo_id: int

    class Config:
        from_attributes = True