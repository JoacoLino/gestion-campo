from sqlalchemy.orm import Session
from app.models.insumo_models import Insumo
from app.schemas.insumo_schemas import InsumoCreate

def crear_insumo(db: Session, insumo: InsumoCreate, campo_id: int):
    db_insumo = Insumo(
        name=insumo.name,
        unidades=insumo.unidades,
        stock=insumo.stock,
        campo_id=campo_id
    )
    db.add(db_insumo)
    db.commit()
    db.refresh(db_insumo)
    return db_insumo

def listar_insumos(db: Session, campo_id: int):
    return db.query(Insumo).filter(Insumo.campo_id == campo_id).all()
