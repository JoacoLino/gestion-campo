from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.database import get_db
from app.auth.auth_dependencies import obtener_usuario_actual
from app.models.campo_models import Campo
from app.models.animal_models import Animal
from app.models.lote_models import Lote
from app.models.sanidad_models import EventoSanitario
from app.models.agenda_models import AgendaEvento
from app.models.users_models import User 

router = APIRouter()

def validar_dueno(campo_id: int, user: User, db: Session):
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return campo

@router.get("/{campo_id}/stats")
def obtener_estadisticas(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    validar_dueno(campo_id, current_user, db)

    # 1. TOTALES BÁSICOS
    total_animales = db.query(Animal).filter(Animal.campo_id == campo_id).count()
    total_lotes = db.query(Lote).filter(Lote.campo_id == campo_id).count()
    total_eventos = db.query(EventoSanitario).filter(EventoSanitario.campo_id == campo_id).count()
    
    # 2. DISTRIBUCIÓN POR CATEGORÍA (Gráfico Torta)
    distribucion = db.query(
        Animal.categoria, func.count(Animal.id)
    ).filter(
        Animal.campo_id == campo_id
    ).group_by(
        Animal.categoria
    ).all()
    categorias_dict = {cat: count for cat, count in distribucion}

    # 3. ALERTAS INTELIGENTES
    alertas = []
    sin_lote = db.query(Animal).filter(Animal.campo_id == campo_id, Animal.lote_id == None).count()
    sin_peso = db.query(Animal).filter(Animal.campo_id == campo_id, (Animal.peso == 0) | (Animal.peso == None)).count()
    
    lotes_db = db.query(Lote).filter(Lote.campo_id == campo_id).all()
    lotes_vacios = sum(1 for lote in lotes_db if len(lote.animales) == 0)
    
    hoy = date.today()
    tareas_hoy = db.query(AgendaEvento).filter(AgendaEvento.campo_id == campo_id, AgendaEvento.completado == False, AgendaEvento.fecha == hoy).count()
    tareas_atrasadas = db.query(AgendaEvento).filter(AgendaEvento.campo_id == campo_id, AgendaEvento.completado == False, AgendaEvento.fecha < hoy).count()

    if sin_lote > 0: alertas.append({"tipo": "danger", "mensaje": f"{sin_lote} animales sin lote asignado"})
    if sin_peso > 0: alertas.append({"tipo": "warning", "mensaje": f"{sin_peso} animales sin registro de peso"})
    if lotes_vacios > 0: alertas.append({"tipo": "info", "mensaje": f"{lotes_vacios} potreros vacíos disponibles"})
    if tareas_hoy > 0: alertas.insert(0, {"tipo": "info", "mensaje": f"📅 Tienes {tareas_hoy} tareas para hoy"})
    if tareas_atrasadas > 0: alertas.insert(0, {"tipo": "warning", "mensaje": f"⏰ Tienes {tareas_atrasadas} tareas atrasadas"})

    # 4. [NUEVO] GRÁFICO DE BARRAS: ACTIVIDAD SANITARIA POR MES (Año Actual)
    # Inicializamos contadores en 0 para los 12 meses
    meses_map = {1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 
                 7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"}
    conteo_mes = {m: 0 for m in range(1, 13)}
    
    todos_eventos = db.query(EventoSanitario).filter(EventoSanitario.campo_id == campo_id).all()
    
    anio_actual = date.today().year
    for ev in todos_eventos:
        # Solo sumamos si el evento es de este año
        if ev.fecha.year == anio_actual:
            conteo_mes[ev.fecha.month] += 1
            
    # Formateamos para que el Frontend lo lea fácil: [{name: "Ene", eventos: 5}, ...]
    grafico_barras = []
    for mes_num in range(1, 13):
        grafico_barras.append({
            "name": meses_map[mes_num],
            "eventos": conteo_mes[mes_num]
        })

    return {
        "total_animales": total_animales,
        "total_lotes": total_lotes,
        "total_eventos": total_eventos,
        "categorias": categorias_dict,
        "alertas": alertas,
        "actividad_mensual": grafico_barras # <--- Dato nuevo
    }