from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from datetime import datetime

from app.database import get_db
from app.models.campo_models import Campo
from app.models.animal_models import Animal
from app.models.lote_models import Lote
from app.models.sanidad_models import EventoSanitario
from app.models.users_models import User
# 👇 IMPORTAMOS LA LLAVE MAESTRA
from app.auth.auth_dependencies import obtener_usuario_actual, verificar_acceso_campo

router = APIRouter()

# (Borramos la función validar_dueno antigua)

# --- 1. REPORTE DE STOCK (ANIMALES) ---
@router.get("/stock/{campo_id}")
def exportar_stock(
    campo_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual),
    # 👇 Validación Automática: El peón también puede descargar
    campo_validado: Campo = Depends(verificar_acceso_campo)
):
    # Usamos campo_validado para el nombre del archivo
    animales = db.query(Animal).filter(Animal.campo_id == campo_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(['Caravana', 'Categoria', 'Raza', 'Peso (kg)', 'Ubicacion', 'Fecha Ult. Actividad'])
    
    for animal in animales:
        nombre_lote = animal.lote.name if animal.lote else "Sin Asignar"
        # Manejo seguro de nulos en raza y peso
        raza = animal.raza if animal.raza else "-"
        peso = str(animal.peso).replace('.', ',') if animal.peso else "0"
        
        writer.writerow([
            animal.caravana, animal.categoria, raza, 
            peso, nombre_lote, datetime.now().strftime("%d/%m/%Y")
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename=Stock_{campo_validado.name}.csv"}
    )

# --- 2. REPORTE DE LOTES (TIERRA) ---
@router.get("/lotes/{campo_id}")
def exportar_lotes(
    campo_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo) # <--- Llave Maestra
):
    lotes = db.query(Lote).filter(Lote.campo_id == campo_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(['Nombre Potrero', 'Superficie (Has)', 'Cultivo/Recurso', 'Cabezas Actuales'])
    
    for lote in lotes:
        # Manejo seguro de nulos
        sup = str(lote.superficie).replace('.', ',') if lote.superficie else "0"
        cultivo = lote.cultivo if lote.cultivo else "Natural"
        
        writer.writerow([
            lote.name, sup, 
            cultivo, len(lote.animales)
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename=Lotes_{campo_validado.name}.csv"}
    )

# --- 3. REPORTE SANITARIO (HISTORIAL) ---
@router.get("/sanidad/{campo_id}")
def exportar_sanidad(
    campo_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo) # <--- Llave Maestra
):
    eventos = db.query(EventoSanitario).filter(EventoSanitario.campo_id == campo_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(['Fecha', 'Tipo', 'Producto', 'Aplicado A', 'Notas', 'Costo'])
    
    for ev in eventos:
        aplicado_a = f"{ev.animal.caravana} ({ev.animal.categoria})" if ev.animal else "Todo el Rodeo"
        costo = str(ev.costo_total).replace('.', ',') if ev.costo_total else "0"
        
        writer.writerow([
            ev.fecha, ev.tipo, ev.producto, aplicado_a, 
            ev.notas or "", costo
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename=Sanidad_{campo_validado.name}.csv"}
    )