from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.insumo_models import Insumo
from app.models.campo_models import Campo
from app.models.users_models import User
from app.schemas.insumo_schemas import InsumoCreate, InsumoOut
from app.auth.auth_dependencies import obtener_usuario_actual

router = APIRouter()

# --- SEGURIDAD ---
def validar_dueno(campo_id: int, user: User, db: Session):
    # Verificación segura usando el objeto User
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="Sin permiso sobre este campo")
    return campo

# 1. LISTAR INSUMOS
@router.get("/{campo_id}/", response_model=List[InsumoOut])
def listar_insumos(
    campo_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    validar_dueno(campo_id, current_user, db)
    return db.query(Insumo).filter(Insumo.campo_id == campo_id).all()

# 2. CREAR INSUMO
@router.post("/{campo_id}/", response_model=InsumoOut)
def crear_insumo(
    campo_id: int, 
    insumo: InsumoCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    validar_dueno(campo_id, current_user, db)
    
    nuevo = Insumo(**insumo.dict(), campo_id=campo_id)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# 3. ACTUALIZAR STOCK (MOVIMIENTO)
@router.put("/{insumo_id}/stock")
def actualizar_stock(
    insumo_id: int,
    cantidad: float, # Puede ser positiva (compra) o negativa (uso)
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    if not insumo: raise HTTPException(status_code=404, detail="Insumo no encontrado")
    
    validar_dueno(insumo.campo_id, current_user, db)
    
    insumo.stock += cantidad
    db.commit()
    
    return {"mensaje": "Stock actualizado", "nuevo_stock": insumo.stock}

# 4. BORRAR
@router.delete("/{insumo_id}")
def borrar_insumo(
    insumo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    if not insumo: raise HTTPException(status_code=404, detail="No existe")
    
    validar_dueno(insumo.campo_id, current_user, db)
    
    db.delete(insumo)
    db.commit()
    return {"mensaje": "Eliminado"}