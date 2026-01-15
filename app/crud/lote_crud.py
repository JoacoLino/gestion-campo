# app/crud/lote_crud.py
from sqlalchemy.orm import Session
from app.models.lote_models import Lote
from app.schemas.lote_schemas import LoteCreate

def crear_lote(db: Session, lote: LoteCreate, campo_id: int):
    # Creamos el objeto Lote asignándole el campo_id
    db_lote = Lote(
        name=lote.name,
        superficie=lote.superficie,
        cultivo=lote.cultivo,
        campo_id=campo_id
    )
    db.add(db_lote)
    db.commit()
    db.refresh(db_lote)
    return db_lote

def obtener_lotes_por_campo(db: Session, campo_id: int):
    return db.query(Lote).filter(Lote.campo_id == campo_id).all()

def eliminar_lote(db: Session, lote_id: int):
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if lote:
        db.delete(lote)
        db.commit()
        return True
    return False
