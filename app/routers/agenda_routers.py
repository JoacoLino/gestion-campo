from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.models.agenda_models import AgendaEvento
from app.schemas.agenda_schemas import EventoCreate, EventoOut
from app.auth.auth_dependencies import obtener_usuario_actual
from app.routers.animal_routers import validar_dueno_campo # Reutilizamos la seguridad

router = APIRouter()

# GET: Listar todos los eventos del campo
@router.get("/{campo_id}/", response_model=List[EventoOut])
def listar_eventos(campo_id: int, db: Session = Depends(get_db), current_user = Depends(obtener_usuario_actual)):
    validar_dueno_campo(campo_id, current_user, db)
    # Ordenamos por fecha para que el calendario se vea bien
    return db.query(AgendaEvento).filter(AgendaEvento.campo_id == campo_id).order_by(AgendaEvento.fecha).all()

# POST: Crear evento
@router.post("/{campo_id}/", response_model=EventoOut)
def crear_evento(campo_id: int, evento: EventoCreate, db: Session = Depends(get_db), current_user = Depends(obtener_usuario_actual)):
    validar_dueno_campo(campo_id, current_user, db)
    
    nuevo_evento = AgendaEvento(
        **evento.dict(),
        campo_id=campo_id
    )
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento

# PUT: Marcar como completado (Check)
@router.put("/check/{evento_id}")
def toggle_completado(evento_id: int, db: Session = Depends(get_db), current_user = Depends(obtener_usuario_actual)):
    evento = db.query(AgendaEvento).filter(AgendaEvento.id == evento_id).first()
    if not evento: raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    validar_dueno_campo(evento.campo_id, current_user, db)
    
    evento.completado = not evento.completado # Invertimos el valor
    db.commit()
    return {"mensaje": "Estado actualizado", "completado": evento.completado}

# DELETE: Borrar evento
@router.delete("/{evento_id}")
def borrar_evento(evento_id: int, db: Session = Depends(get_db), current_user = Depends(obtener_usuario_actual)):
    evento = db.query(AgendaEvento).filter(AgendaEvento.id == evento_id).first()
    if not evento: raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    validar_dueno_campo(evento.campo_id, current_user, db)
    
    db.delete(evento)
    db.commit()
    return {"mensaje": "Evento eliminado"}