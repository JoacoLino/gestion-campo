from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.lote_schemas import LoteCreate, LoteOut
from app.crud.lote_crud import crear_lote, listar_lotes

router = APIRouter()

# Crear un lote
@router.post("/", response_model=LoteOut)
def crear_nuevo_lote(
    lote: LoteCreate,
    campo_id: int,
    db: Session = Depends(get_db)
):
    return crear_lote(db, lote, campo_id)

# Listar todos los lotes de un campo
@router.get("/", response_model=List[LoteOut])
def obtener_lotes(campo_id: int, db: Session = Depends(get_db)):
    return listar_lotes(db, campo_id)
