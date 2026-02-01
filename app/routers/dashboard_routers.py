# app/routers/dashboard_routers.py
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

router = APIRouter()

# Función auxiliar de seguridad
def validar_dueno(campo_id: int, user_email: str, db: Session):
    user = db.query(User).filter(User.email == user_email).first()
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="Acceso denegado al campo")
    return campo

@router.get("/{campo_id}/stats")
def obtener_estadisticas(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(obtener_usuario_actual)
):
    # 1. Validar seguridad
    validar_dueno(campo_id, current_user_email, db)

    # 2. Consultas de Agregación (Contar cosas)
    
    # Total de animales
    total_animales = db.query(Animal).filter(Animal.campo_id == campo_id).count()
    
    # Total de lotes
    total_lotes = db.query(Lote).filter(Lote.campo_id == campo_id).count()
    
    # Eventos sanitarios recientes (últimos 30 días o total histórico)
    # Por ahora contamos el total histórico
    total_eventos = db.query(EventoSanitario).filter(EventoSanitario.campo_id == campo_id).count()
    
    # Distribución por Categoría (Ej: {"Vaca": 10, "Toro": 1})
    # Esto es una consulta SQL "GROUP BY"
    distribucion = db.query(
        Animal.categoria, func.count(Animal.id)
    ).filter(
        Animal.campo_id == campo_id
    ).group_by(
        Animal.categoria
    ).all()
    
    # Convertimos la lista de tuplas a un diccionario simple
    categorias_dict = {cat: count for cat, count in distribucion}

    return {
        "total_animales": total_animales,
        "total_lotes": total_lotes,
        "total_eventos": total_eventos,
        "categorias": categorias_dict
    }