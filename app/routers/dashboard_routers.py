from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth.auth_dependencies import obtener_usuario_actual
from app.models.campo_models import Campo
from app.models.animal_models import Animal
from app.models.lote_models import Lote
from app.models.sanidad_models import EventoSanitario
from app.models.users_models import User

from datetime import date # <--- Importar date
from app.models.agenda_models import AgendaEvento # <--- Importar el modelo de Agenda

router = APIRouter()

def validar_dueno(campo_id: int, user_email: str, db: Session):
    user = db.query(User).filter(User.email == user_email).first()
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return campo

@router.get("/{campo_id}/stats")
def obtener_estadisticas(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual)
):
    validar_dueno(campo_id, current_user_email, db)

    # 1. TOTALES BÁSICOS
    total_animales = db.query(Animal).filter(Animal.campo_id == campo_id).count()
    total_lotes = db.query(Lote).filter(Lote.campo_id == campo_id).count()
    total_eventos = db.query(EventoSanitario).filter(EventoSanitario.campo_id == campo_id).count()
    
    # 2. DISTRIBUCIÓN
    distribucion = db.query(
        Animal.categoria, func.count(Animal.id)
    ).filter(
        Animal.campo_id == campo_id
    ).group_by(
        Animal.categoria
    ).all()
    categorias_dict = {cat: count for cat, count in distribucion}

    # --- 3. ALERTAS INTELIGENTES (NUEVO) ---
    
    # A. Animales sin lote ("En el limbo")
    sin_lote = db.query(Animal).filter(
        Animal.campo_id == campo_id, 
        Animal.lote_id == None
    ).count()

    # B. Animales sin peso registrado (Error de carga)
    sin_peso = db.query(Animal).filter(
        Animal.campo_id == campo_id, 
        (Animal.peso == 0) | (Animal.peso == None)
    ).count()

    # C. Lotes Vacíos (Ineficiencia)
    # Obtenemos todos los lotes y verificamos cuáles no tienen animales
    lotes_db = db.query(Lote).filter(Lote.campo_id == campo_id).all()
    lotes_vacios = sum(1 for lote in lotes_db if len(lote.animales) == 0)


    # --- 4. ALERTAS DE AGENDA (NUEVO) ---
    hoy = date.today()

    # A. Tareas para HOY (Pendientes)
    tareas_hoy = db.query(AgendaEvento).filter(
        AgendaEvento.campo_id == campo_id,
        AgendaEvento.completado == False,
        AgendaEvento.fecha == hoy
    ).count()

    # B. Tareas Atrasadas (Vencidas y sin completar)
    tareas_atrasadas = db.query(AgendaEvento).filter(
        AgendaEvento.campo_id == campo_id,
        AgendaEvento.completado == False,
        AgendaEvento.fecha < hoy
    ).count()

    # Construimos el objeto de alertas
    alertas = []
    if sin_lote > 0:
        alertas.append({"tipo": "danger", "mensaje": f"{sin_lote} animales sin lote asignado"})
    if sin_peso > 0:
        alertas.append({"tipo": "warning", "mensaje": f"{sin_peso} animales sin registro de peso"})
    if lotes_vacios > 0:
        alertas.append({"tipo": "info", "mensaje": f"{lotes_vacios} potreros vacíos disponibles"})
    if tareas_hoy > 0:
        alertas.insert(0, {"tipo": "info", "mensaje": f"📅 Tienes {tareas_hoy} tareas para hoy"}) # .insert(0) para que salga primera
    
    if tareas_atrasadas > 0:
        alertas.insert(0, {"tipo": "warning", "mensaje": f"⏰ Tienes {tareas_atrasadas} tareas atrasadas"})

    return {
        "total_animales": total_animales,
        "total_lotes": total_lotes,
        "total_eventos": total_eventos,
        "categorias": categorias_dict,
        "alertas": alertas # <--- Enviamos esto al frontend
    }