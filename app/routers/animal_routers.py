from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.animal_schemas import AnimalCreate, AnimalResponse
from app.crud import animal_crud

# --- CAMBIO CLAVE: Importamos tu dependencia existente ---
from app.auth.auth_dependencies import obtener_usuario_actual

router = APIRouter(
    prefix="/animales",
    tags=["Animales"]
)

# 1. Obtener animales (Protegido con tu cookie)
@router.get("/{campo_id}/", response_model=List[AnimalResponse])
def read_animales(
    campo_id: int, 
    db: Session = Depends(get_db),
    current_email: str = Depends(obtener_usuario_actual) # Valida la cookie
):
    return animal_crud.get_animales_by_campo(db, campo_id=campo_id)

# 2. Crear animal (Protegido)
@router.post("/{campo_id}/", response_model=AnimalResponse)
def create_new_animal(
    campo_id: int, 
    animal: AnimalCreate, 
    db: Session = Depends(get_db),
    current_email: str = Depends(obtener_usuario_actual)
):
    return animal_crud.create_animal(db=db, animal=animal, campo_id=campo_id)

# 3. Eliminar animal (Protegido)
@router.delete("/{animal_id}")
def delete_existing_animal(
    animal_id: int, 
    db: Session = Depends(get_db),
    current_email: str = Depends(obtener_usuario_actual)
):
    deleted = animal_crud.delete_animal(db=db, animal_id=animal_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return {"message": "Animal eliminado correctamente"}