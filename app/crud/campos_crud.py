from sqlalchemy.orm import Session
from app.models.campo_models import Campo
from app.schemas.campos_schemas import CampoCreate

def crear_campo(db: Session, campo: CampoCreate, user_id: int):
    db_campo = Campo(name=campo.name, location=campo.location, user_id=user_id)
    db.add(db_campo)
    db.commit()
    db.refresh(db_campo)
    return db_campo

def listar_campos(db: Session, user_id: int):
    return db.query(Campo).filter(Campo.user_id == user_id).all()

def eliminar_campo(db: Session, campo_id: int, user_id: int):
    # Buscamos el campo asegurándonos de que pertenezca a este usuario
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user_id).first()
    
    if campo:
        db.delete(campo)
        db.commit()
        return True # Se borró con éxito
    return False # No se encontró o no era de este usuario
