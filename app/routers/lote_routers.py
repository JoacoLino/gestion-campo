# app/routers/lote_routers.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.lote_schemas import LoteCreate, LoteOut
from app.crud.lote_crud import crear_lote, obtener_lotes_por_campo, eliminar_lote
from app.models.campo_models import Campo
from app.models.lote_models import Lote
from app.models.users_models import User
from app.auth.auth_dependencies import obtener_usuario_actual

router = APIRouter()

# --- VALIDACIÓN DE SEGURIDAD ---
def validar_dueno_campo(campo_id: int, user_email: str, db: Session):
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Buscamos si el campo existe Y es del usuario
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre este campo")
    return campo

# 1. CREAR LOTE
@router.post("/{campo_id}/", response_model=LoteOut)
def create_new_lote(
    campo_id: int,
    lote: LoteCreate,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual)
):
    # Verificamos que el campo sea tuyo antes de crear nada
    validar_dueno_campo(campo_id, current_user_email, db)
    return crear_lote(db, lote, campo_id)

# 2. LISTAR LOTES DE UN CAMPO
@router.get("/{campo_id}/", response_model=List[LoteOut])
def read_lotes(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual)
):
    validar_dueno_campo(campo_id, current_user_email, db)
    return obtener_lotes_por_campo(db, campo_id)

# 3. ELIMINAR LOTE
@router.delete("/{lote_id}")
def delete_lote(
    lote_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual)
):
    # Primero averiguamos de quién es el lote para ver si tienes permiso
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    
    # Validamos que el dueño del campo (al que pertenece el lote) seas tú
    validar_dueno_campo(lote.campo_id, current_user_email, db)
    
    eliminar_lote(db, lote_id)
    return {"mensaje": "Lote eliminado correctamente"}