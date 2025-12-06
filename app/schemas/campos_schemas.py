from pydantic import BaseModel


class CampoBase(BaseModel):
    name: str
    location: str

class CampoCreate(CampoBase):
    pass

class CampoOut(CampoBase):
    id: int

    class Config:
        orm_mode = True