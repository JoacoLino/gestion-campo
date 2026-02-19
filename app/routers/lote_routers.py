from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.lote_schemas import LoteCreate, LoteOut
from app.models.campo_models import Campo
from app.models.lote_models import Lote
from app.models.users_models import User
# Importamos la llave maestra
from app.auth.auth_dependencies import obtener_usuario_actual, verificar_acceso_campo

router = APIRouter()

# 1. CREAR LOTE (Funciona bien porque tiene campo_id en URL)
@router.post("/{campo_id}/", response_model=LoteOut)
def create_new_lote(
    campo_id: int,
    lote: LoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    nuevo_lote = Lote(**lote.dict(), campo_id=campo_id)
    db.add(nuevo_lote)
    db.commit()
    db.refresh(nuevo_lote)
    return nuevo_lote

# 2. LISTAR LOTES (Funciona bien porque tiene campo_id en URL)
@router.get("/{campo_id}/", response_model=List[LoteOut])
def read_lotes(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    lotes = db.query(Lote).filter(Lote.campo_id == campo_id).all()
    return lotes

# 3. ELIMINAR LOTE (🔴 AQUÍ ESTABA EL ERROR)
@router.delete("/{lote_id}")
def delete_lote(
    lote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
    # ❌ QUITAMOS "Depends(verificar_acceso_campo)" AQUÍ
    # Porque la URL no tiene el campo_id, así que FastAPI no sabe qué validar todavía.
):
    # 1. Primero buscamos el lote
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    
    # 2. ✅ AHORA SÍ VALIDAMOS MANUALMENTE
    # Usamos el campo_id que estaba guardado dentro del lote
    verificar_acceso_campo(lote.campo_id, db, current_user)
    
    # 3. Eliminar
    db.delete(lote)
    db.commit()
    return {"mensaje": "Lote eliminado correctamente"}