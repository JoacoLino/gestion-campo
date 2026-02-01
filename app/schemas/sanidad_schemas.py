from pydantic import BaseModel
from typing import Optional
from datetime import date

class SanidadBase(BaseModel):
    fecha: date
    tipo: str
    producto: str # <--- Lo puse obligatorio porque suele serlo
    notas: Optional[str] = None
    costo_total: Optional[float] = 0
    animal_id: Optional[int] = None 

class SanidadCreate(SanidadBase):
    pass

class SanidadOut(SanidadBase):
    id: int
    campo_id: int
    
    nombre_animal: Optional[str] = None 

    class Config:
        # CAMBIO CLAVE AQUÍ:
        # Antes: orm_mode = True
        # Ahora (Pydantic V2): from_attributes = True
        from_attributes = True