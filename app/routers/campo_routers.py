from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.campos_schemas import CampoCreate, CampoOut
from app.models.campo_models import Campo, CampoMiembro
from app.auth.auth_dependencies import obtener_usuario_actual, verificar_acceso_campo
from app.models.users_models import User
from app.crud.campos_crud import crear_campo, listar_campos, eliminar_campo

router = APIRouter()

# --- 1. CREAR CAMPO (Con restricción para Peones) ---
@router.post("/", response_model=CampoOut)
def crear_nuevo_campo(
    campo: CampoCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual) 
):
    # 🔒 BLOQUEO PARA PEONES
    # Verificamos si este usuario trabaja como peón en algún lado
    es_empleado = db.query(CampoMiembro).filter(
        CampoMiembro.user_id == current_user.id, 
        CampoMiembro.rol == 'peon'
    ).first()

    if es_empleado:
        raise HTTPException(
            status_code=403, 
            detail="Las cuentas de equipo (Peón/Encargado) no pueden crear nuevos establecimientos."
        )

    # Si no es empleado, procede normal
    nuevo_campo = Campo(**campo.dict(), user_id=current_user.id) 
    db.add(nuevo_campo)
    db.commit()
    db.refresh(nuevo_campo)
    return nuevo_campo


# --- 2. OBTENER MIS CAMPOS (Dueños y Empleados) ---
@router.get("/mis_campos", response_model=List[CampoOut])
def obtener_mis_campos(
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual), 
):
    # 1. Campos propios
    campos_propios = db.query(Campo).filter(Campo.user_id == current_user.id).all()

    # 2. Campos asignados (donde soy empleado)
    membresias = db.query(CampoMiembro).filter(CampoMiembro.user_id == current_user.id).all()
    campos_asignados = []
    if membresias:
        ids_campos = [m.campo_id for m in membresias]
        campos_asignados = db.query(Campo).filter(Campo.id.in_(ids_campos)).all()

    todos_los_campos = list(set(campos_propios + campos_asignados))
    return todos_los_campos


# --- 3. BORRAR CAMPO (Corregido) ---
@router.delete("/{campo_id}")
def borrar_campo(
    campo_id: int,
    db: Session = Depends(get_db),
    # ✅ CORRECCIÓN: Usamos 'User', no 'str'
    current_user: User = Depends(obtener_usuario_actual)
):
    # Ya tenemos el usuario completo en 'current_user', no hace falta buscarlo de nuevo.
    
    # 1. Verificación manual de propiedad
    # (Aseguramos que solo el dueño real pueda borrar, ni siquiera los admins/encargados)
    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
        
    if campo.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este campo.")

    # 2. Eliminar usando la lógica segura
    exito = eliminar_campo(db, campo_id, current_user.id)
    
    if not exito:
        raise HTTPException(status_code=400, detail="Error al eliminar el campo")
    
    return {"mensaje": "Campo eliminado correctamente"}


# --- 4. DETALLE CAMPO (Con llave maestra) ---
@router.get("/{campo_id}", response_model=CampoOut)
def obtener_detalle_campo(
    campo_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    return campo_validado