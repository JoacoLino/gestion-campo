from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.campos_schemas import CampoCreate, CampoOut
from app.crud.campos_crud import crear_campo, listar_campos

router = APIRouter()

# Crear un campo
@router.post("/", response_model=CampoOut)
def crear_nuevo_campo(
    campo: CampoCreate,
    user_id: int,  # Esto luego se obtendrá del token
    db: Session = Depends(get_db)
):
    return crear_campo(db, campo, user_id)

# Listar campos de un usuario
@router.get("/", response_model=List[CampoOut])
def obtener_campos(user_id: int, db: Session = Depends(get_db)):
    return listar_campos(db, user_id)
