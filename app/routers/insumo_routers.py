from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.insumo_models import Insumo
from app.models.campo_models import Campo
from app.models.users_models import User
from app.schemas.insumo_schemas import InsumoCreate, InsumoOut
# 👇 1. Importar la nueva seguridad
from app.auth.auth_dependencies import obtener_usuario_actual, verificar_acceso_campo

router = APIRouter()

# (Borramos la función 'validar_dueno' antigua, ya no sirve)

# 1. LISTAR INSUMOS (Usa validación automática)
@router.get("/{campo_id}/", response_model=List[InsumoOut])
def listar_insumos(
    campo_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    # 👇 Validación automática: Dueño O Peón pasan
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    # Sin filtros de usuario, solo campo
    return db.query(Insumo).filter(Insumo.campo_id == campo_id).all()

# 2. CREAR INSUMO (Usa validación automática)
@router.post("/{campo_id}/", response_model=InsumoOut)
def crear_insumo(
    campo_id: int, 
    insumo: InsumoCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    nuevo = Insumo(**insumo.dict(), campo_id=campo_id)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# 3. ACTUALIZAR STOCK (Validación MANUAL)
# Como la URL no tiene campo_id, validamos después de buscar el insumo
@router.put("/{insumo_id}/stock")
def actualizar_stock(
    insumo_id: int,
    cantidad: float, # Puede ser positiva (compra) o negativa (uso)
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    if not insumo: 
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    
    # 👇 Validación Manual: Usamos el campo_id del insumo encontrado
    verificar_acceso_campo(insumo.campo_id, db, current_user)
    
    insumo.stock += cantidad
    db.commit()
    
    return {"mensaje": "Stock actualizado", "nuevo_stock": insumo.stock}

# 4. BORRAR (Validación MANUAL)
@router.delete("/{insumo_id}")
def borrar_insumo(
    insumo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    if not insumo: 
        raise HTTPException(status_code=404, detail="No existe")
    
    # 👇 Validación Manual
    verificar_acceso_campo(insumo.campo_id, db, current_user)
    
    db.delete(insumo)
    db.commit()
    return {"mensaje": "Eliminado"}