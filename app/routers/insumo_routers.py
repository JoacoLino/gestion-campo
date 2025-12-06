from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.insumo_schemas import InsumoCreate, InsumoOut
from app.crud.insumo_crud import crear_insumo, listar_insumos

router = APIRouter()

@router.post("/", response_model=InsumoOut)
def crear_nuevo_insumo(insumo: InsumoCreate, campo_id: int, db: Session = Depends(get_db)):
    return crear_insumo(db, insumo, campo_id)

@router.get("/", response_model=List[InsumoOut])
def obtener_insumos(campo_id: int, db: Session = Depends(get_db)):
    return listar_insumos(db, campo_id)
