from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.users_models import User
from app.models.campo_models import Campo
from app.models.sanidad_models import EventoSanitario
from app.schemas.sanidad_schemas import SanidadCreate, SanidadOut
# Importamos la llave maestra
from app.auth.auth_dependencies import obtener_usuario_actual, verificar_acceso_campo

router = APIRouter()

# (Borramos la función 'validar_acceso' antigua, ya no la necesitamos)

# 1. REGISTRAR UN EVENTO SANITARIO (Validación Automática)
@router.post("/{campo_id}/", response_model=SanidadOut)
def crear_evento(
    campo_id: int,
    evento: SanidadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    # 👇 Validación Automática: Dueño O Peón pasan
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    # Ya no llamamos a validar_acceso manual.
    
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

# 2. VER HISTORIAL SANITARIO DEL CAMPO (Ya estaba bien, lo dejamos igual)
@router.get("/{campo_id}/", response_model=List[SanidadOut])
def listar_eventos(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    eventos = db.query(EventoSanitario)\
                .filter(EventoSanitario.campo_id == campo_id)\
                .order_by(EventoSanitario.fecha.desc())\
                .all()
    
    # Inyectar nombre del animal si existe
    resultado = []
    for ev in eventos:
        ev_out = SanidadOut.from_orm(ev) 
        if ev.animal:
            ev_out.nombre_animal = f"{ev.animal.caravana} ({ev.animal.categoria})"
        resultado.append(ev_out)
        
    return resultado

# 3. ELIMINAR EVENTO (Validación Manual)
@router.delete("/{evento_id}")
def eliminar_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    # Primero buscamos el evento
    evento = db.query(EventoSanitario).filter(EventoSanitario.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    # 👇 Validación Manual con la llave maestra
    verificar_acceso_campo(evento.campo_id, db, current_user)
    
    db.delete(evento)
    db.commit()
    return {"mensaje": "Evento eliminado"}