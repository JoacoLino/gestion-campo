from pydantic import BaseModel


class InsumoBase(BaseModel):
    name: str
    unidades: int
    stock: int

class InsumoCreate(InsumoBase):
    pass

class InsumoOut(InsumoBase):
    id: int

    class Config:
        orm_mode = True