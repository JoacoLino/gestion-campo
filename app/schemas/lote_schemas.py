from pydantic import BaseModel


class LoteBase(BaseModel):
    name: str
    poligono: str
    cultivo: str

class LoteCreate(LoteBase):
    pass

class LoteOut(LoteBase):
    id: int

    class Config:
        orm_mode = True