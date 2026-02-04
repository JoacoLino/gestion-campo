from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from datetime import datetime

from app.database import get_db
from app.auth.auth_dependencies import obtener_usuario_actual
from app.models.campo_models import Campo
from app.models.animal_models import Animal
from app.models.lote_models import Lote
from app.models.sanidad_models import EventoSanitario
from app.models.users_models import User

router = APIRouter()

# --- SEGURIDAD ACTUALIZADA ---
def validar_dueno(campo_id: int, user: User, db: Session):
    # Usamos user.id directamente
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo: raise HTTPException(status_code=403, detail="Sin permiso")
    return campo

# --- 1. REPORTE DE STOCK (ANIMALES) ---
@router.get("/stock/{campo_id}")
def exportar_stock(campo_id: int, db: Session = Depends(get_db), current_user: User = Depends(obtener_usuario_actual)):
    campo = validar_dueno(campo_id, current_user, db)
    animales = db.query(Animal).filter(Animal.campo_id == campo_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(['Caravana', 'Categoria', 'Raza', 'Peso (kg)', 'Ubicacion', 'Fecha Ult. Actividad'])
    
    for animal in animales:
        nombre_lote = animal.lote.name if animal.lote else "Sin Asignar"
        writer.writerow([
            animal.caravana, animal.categoria, animal.raza or "-", 
            str(animal.peso).replace('.', ','), nombre_lote, datetime.now().strftime("%d/%m/%Y")
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename=Stock_{campo.name}.csv"}
    )

# --- 2. REPORTE DE LOTES (TIERRA) ---
@router.get("/lotes/{campo_id}")
def exportar_lotes(campo_id: int, db: Session = Depends(get_db), current_user: User = Depends(obtener_usuario_actual)):
    campo = validar_dueno(campo_id, current_user, db)
    lotes = db.query(Lote).filter(Lote.campo_id == campo_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(['Nombre Potrero', 'Superficie (Has)', 'Cultivo/Recurso', 'Cabezas Actuales'])
    
    for lote in lotes:
        writer.writerow([
            lote.name, str(lote.superficie).replace('.', ','), 
            lote.cultivo or "Natural", len(lote.animales)
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename=Lotes_{campo.name}.csv"}
    )

# --- 3. REPORTE SANITARIO (HISTORIAL) ---
@router.get("/sanidad/{campo_id}")
def exportar_sanidad(campo_id: int, db: Session = Depends(get_db), current_user: User = Depends(obtener_usuario_actual)):
    campo = validar_dueno(campo_id, current_user, db)
    eventos = db.query(EventoSanitario).filter(EventoSanitario.campo_id == campo_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(['Fecha', 'Tipo', 'Producto', 'Aplicado A', 'Notas', 'Costo'])
    
    for ev in eventos:
        aplicado_a = f"{ev.animal.caravana} ({ev.animal.categoria})" if ev.animal else "Todo el Rodeo"
        writer.writerow([
            ev.fecha, ev.tipo, ev.producto, aplicado_a, 
            ev.notas or "", str(ev.costo_total).replace('.', ',')
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename=Sanidad_{campo.name}.csv"}
    )