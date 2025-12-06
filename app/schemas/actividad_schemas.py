from pydantic import BaseModel
from datetime import date

class ActividadBase(BaseModel):
    tipo: str
    fecha: date
    notas: str

class ActividadCreate(ActividadBase):
    pass

class ActividadOut(ActividadBase):
    id: int

    class Config:
        orm_mode = True