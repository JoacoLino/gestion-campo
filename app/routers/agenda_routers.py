from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.agenda_models import AgendaEvento
from app.models.campo_models import Campo
from app.models.users_models import User
from app.schemas.agenda_schemas import EventoCreate, EventoOut
# Importamos la llave maestra
from app.auth.auth_dependencies import obtener_usuario_actual, verificar_acceso_campo

router = APIRouter()

# 1. GET: Listar (Usa validación automática)
@router.get("/{campo_id}/", response_model=List[EventoOut])
def listar_eventos(
    campo_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo) # ✅ Automático
):
    # Ya está validado, filtramos directo
    return db.query(AgendaEvento).filter(AgendaEvento.campo_id == campo_id).order_by(AgendaEvento.fecha).all()

# 2. POST: Crear (Usa validación automática)
@router.post("/{campo_id}/", response_model=EventoOut)
def crear_evento(
    campo_id: int, 
    evento: EventoCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo) # ✅ Automático
):
    nuevo_evento = AgendaEvento(**evento.dict(), campo_id=campo_id)
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento

# 3. PUT: Check (Validación MANUAL porque no hay campo_id en URL)
@router.put("/check/{evento_id}")
def toggle_completado(
    evento_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual)
):
    # Primero buscamos el evento
    evento = db.query(AgendaEvento).filter(AgendaEvento.id == evento_id).first()
    if not evento: 
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # ✅ Validamos manualmente usando el campo_id del evento
    # (Pasamos los argumentos en orden: campo_id, db, usuario)
    verificar_acceso_campo(evento.campo_id, db, current_user)
    
    evento.completado = not evento.completado
    db.commit()
    return {"mensaje": "Estado actualizado", "completado": evento.completado}

# 4. DELETE: Borrar (Validación MANUAL)
@router.delete("/{evento_id}")
def borrar_evento(
    evento_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual)
):
    evento = db.query(AgendaEvento).filter(AgendaEvento.id == evento_id).first()
    if not evento: 
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # ✅ Validación manual
    verificar_acceso_campo(evento.campo_id, db, current_user)
    
    db.delete(evento)
    db.commit()
    return {"mensaje": "Evento eliminado"}