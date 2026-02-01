from sqlalchemy.orm import Session
from app.models.animal_models import Animal
from app.schemas.animal_schemas import AnimalCreate

def get_animales_by_campo(db: Session, campo_id: int):
    return db.query(Animal).filter(Animal.campo_id == campo_id).all()

def create_animal(db: Session, animal: AnimalCreate, campo_id: int):
    db_animal = Animal(
        caravana=animal.caravana,
        categoria=animal.categoria,
        raza=animal.raza,
        peso=animal.peso,
        lote_id=animal.lote_id,
        campo_id=campo_id
    )
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)
    return db_animal

def delete_animal(db: Session, animal_id: int):
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if animal:
        db.delete(animal)
        db.commit()
        return True
    return False