from sqlalchemy.orm import Session
from app.models.lote_models import Lote
from app.schemas.lote_schemas import LoteCreate

def crear_lote(db: Session, lote: LoteCreate, campo_id: int):
    db_lote = Lote(
        name=lote.name,
        poligono=lote.poligono,
        cultivo=lote.cultivo,
        campo_id=campo_id
    )
    db.add(db_lote)
    db.commit()
    db.refresh(db_lote)
    return db_lote

def listar_lotes(db: Session, campo_id: int):
    return db.query(Lote).filter(Lote.campo_id == campo_id).all()
