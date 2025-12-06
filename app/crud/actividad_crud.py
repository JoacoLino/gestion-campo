from sqlalchemy.orm import Session
from app.models.actividad_models import Actividad
from app.schemas.actividad_schemas import ActividadCreate

def crear_actividad(db: Session, actividad: ActividadCreate, lote_id: int):
    db_actividad = Actividad(
        tipo=actividad.tipo,
        fecha=actividad.fecha,
        notas=actividad.notas,
        lote_id=lote_id
    )
    db.add(db_actividad)
    db.commit()
    db.refresh(db_actividad)
    return db_actividad

def listar_actividades(db: Session, lote_id: int):
    return db.query(Actividad).filter(Actividad.lote_id == lote_id).all()
