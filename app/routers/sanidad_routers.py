from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.users_models import User
from app.models.campo_models import Campo
from app.models.sanidad_models import EventoSanitario
from app.schemas.sanidad_schemas import SanidadCreate, SanidadOut
from app.auth.auth_dependencies import obtener_usuario_actual

router = APIRouter()

# --- VALIDACIÓN DE SEGURIDAD CORREGIDA ---
# Ahora recibe 'user: User' directamente, NO un string 'user_email'
def validar_acceso(campo_id: int, user: User, db: Session):
    # Ya no necesitamos buscar el usuario por email, porque 'user' YA ES el usuario
    
    # Solo verificamos que el campo sea de este usuario usando su ID
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="Permiso denegado sobre este campo")
    return campo

# 1. REGISTRAR UN EVENTO SANITARIO
@router.post("/{campo_id}/", response_model=SanidadOut)
def crear_evento(
    campo_id: int,
    evento: SanidadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # Recibe el objeto User
):
    validar_acceso(campo_id, current_user, db)

    nuevo_evento = EventoSanitario(
        fecha=evento.fecha,
        tipo=evento.tipo,
        producto=evento.producto,
        notas=evento.notas,
        costo_total=evento.costo_total,
        campo_id=campo_id,
        animal_id=evento.animal_id # Puede ser None
    )
    
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento

# 2. VER HISTORIAL SANITARIO DEL CAMPO
@router.get("/{campo_id}/", response_model=List[SanidadOut])
def listar_eventos(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # Recibe el objeto User
):
    validar_acceso(campo_id, current_user, db)
    
    eventos = db.query(EventoSanitario)\
                .filter(EventoSanitario.campo_id == campo_id)\
                .order_by(EventoSanitario.fecha.desc())\
                .all()
    
    # Inyectar nombre del animal si existe
    resultado = []
    for ev in eventos:
        # Usamos from_attributes=True en el schema (Pydantic V2)
        ev_out = SanidadOut.from_orm(ev) 
        if ev.animal:
            ev_out.nombre_animal = f"{ev.animal.caravana} ({ev.animal.categoria})"
        resultado.append(ev_out)
        
    return resultado

# 3. ELIMINAR EVENTO
@router.delete("/{evento_id}")
def eliminar_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # Recibe el objeto User
):
    evento = db.query(EventoSanitario).filter(EventoSanitario.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    validar_acceso(evento.campo_id, current_user, db) # Verificamos dueño
    
    db.delete(evento)
    db.commit()
    return {"mensaje": "Evento eliminado"}