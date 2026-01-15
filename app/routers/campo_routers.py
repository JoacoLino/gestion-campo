from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.campos_schemas import CampoCreate, CampoOut
from app.crud.campos_crud import crear_campo, listar_campos

from app.models.campo_models import Campo
from app.auth.auth_dependencies import obtener_usuario_actual 
from app.models.users_models import User
from app.crud.campos_crud import crear_campo, listar_campos, eliminar_campo

router = APIRouter()

# --- 1. CREAR CAMPO (SEGURO) ---
# Ya no pedimos user_id por parámetro, lo sacamos del token
@router.post("/", response_model=CampoOut)
def crear_nuevo_campo(
    campo: CampoCreate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual) 
):
    # Buscamos al usuario real
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Usamos su ID verdadero para crear el campo
    return crear_campo(db, campo, user.id)


# --- 2. OBTENER MIS CAMPOS (SEGURO) ---
# Este es el que usa tu frontend ahora
@router.get("/mis_campos", response_model=List[CampoOut])
def obtener_mis_campos(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual)
):
    # Buscamos al usuario real
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Usamos su ID verdadero para filtrar
    campos = db.query(Campo).filter(Campo.user_id == user.id).all()
    return campos

# NOTA: He borrado el antiguo 'obtener_campos' que recibía user_id porque era inseguro.

@router.delete("/{campo_id}")
def borrar_campo(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual)
):
    # 1. Buscamos al usuario real
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 2. Intentamos borrar usando el ID del usuario como seguridad
    exito = eliminar_campo(db, campo_id, user.id)
    
    if not exito:
        raise HTTPException(status_code=404, detail="Campo no encontrado o no tienes permiso")
    
    return {"mensaje": "Campo eliminado correctamente"}