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
from app.models.users_models import User # Asegurate de importar User

router = APIRouter()

# --- 1. CREAR CAMPO (SEGURO) ---
# POST: Crear Campo
@router.post("/", response_model=CampoOut)
def crear_nuevo_campo(
    campo: CampoCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual) # <--- User Object
):
    nuevo_campo = Campo(**campo.dict(), user_id=current_user.id) # <--- ID directo
    db.add(nuevo_campo)
    db.commit()
    db.refresh(nuevo_campo)
    return nuevo_campo


# --- 2. OBTENER MIS CAMPOS (SEGURO) ---
# GET: Mis Campos
@router.get("/mis_campos", response_model=List[CampoOut])
def obtener_mis_campos(
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual) # <--- User Object
):
    # Usamos current_user.id directamente
    campos = db.query(Campo).filter(Campo.user_id == current_user.id).all()
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

# GET: Detalle Campo
@router.get("/{campo_id}", response_model=CampoOut)
def obtener_detalle_campo(
    campo_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # <--- User Object
):
    # Usamos current_user.id directamente
    campo = db.query(Campo).filter(
        Campo.id == campo_id, 
        Campo.user_id == current_user.id
    ).first()
    
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
    return campo