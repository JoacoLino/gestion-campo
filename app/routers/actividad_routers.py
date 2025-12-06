from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.actividad_schemas import ActividadCreate, ActividadOut
from app.crud.actividad_crud import crear_actividad, listar_actividades

router = APIRouter()

# Crear una actividad
@router.post("/", response_model=ActividadOut)
def crear_nueva_actividad(
    actividad: ActividadCreate,
    lote_id: int,
    db: Session = Depends(get_db)
):
    return crear_actividad(db, actividad, lote_id)

# Listar todas las actividades de un lote
@router.get("/", response_model=List[ActividadOut])
def obtener_actividades(lote_id: int, db: Session = Depends(get_db)):
    return listar_actividades(db, lote_id)
