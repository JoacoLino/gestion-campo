from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
# Imports de Schemas
from app.schemas.animal_schemas import AnimalCreate, AnimalResponse, MovimientoMasivo 
# Imports de Modelos
from app.models.campo_models import Campo
from app.models.animal_models import Animal
from app.models.users_models import User
from app.models.lote_models import Lote
# Imports de CRUD
from app.crud.animal_crud import create_animal, get_animales_by_campo, delete_animal
# Imports de Auth
from app.auth.auth_dependencies import obtener_usuario_actual

# Definimos el router UNA sola vez
router = APIRouter()

# --- 1. FUNCIÓN DE SEGURIDAD ACTUALIZADA ---
# Recibe el OBJETO user, no el string email
def validar_dueno_campo(campo_id: int, user: User, db: Session):
    # Ya no buscamos el usuario en la BD, ¡ya lo tenemos!
    
    # Buscamos si el campo es de este usuario (usando user.id)
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre este campo")
    return campo

# --- 2. ENDPOINTS ACTUALIZADOS ---

# GET: Listar Animales
@router.get("/{campo_id}/", response_model=List[AnimalResponse])
def read_animales(
    campo_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # <--- Recibimos User
):
    validar_dueno_campo(campo_id, current_user, db)
    return get_animales_by_campo(db, campo_id=campo_id)

# POST: Crear Animal
@router.post("/{campo_id}/", response_model=AnimalResponse)
def create_new_animal(
    campo_id: int, 
    animal: AnimalCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # <--- Recibimos User
):
    validar_dueno_campo(campo_id, current_user, db)
    return create_animal(db, animal, campo_id)

# DELETE: Borrar Animal
@router.delete("/{animal_id}")
def delete_existing_animal(
    animal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # <--- Recibimos User
):
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    
    validar_dueno_campo(animal.campo_id, current_user, db)
    delete_animal(db, animal_id)
    return {"message": "Animal eliminado correctamente"}

# PUT: Movimiento Masivo
@router.put("/mover-masa/{campo_id}")
def mover_animales(
    campo_id: int,
    datos: MovimientoMasivo,
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual) # <--- Recibimos User
):
    validar_dueno_campo(campo_id, current_user, db)

    if datos.nuevo_lote_id:
        lote_destino = db.query(Lote).filter(Lote.id == datos.nuevo_lote_id, Lote.campo_id == campo_id).first()
        if not lote_destino:
            raise HTTPException(status_code=400, detail="El lote destino no existe o no es tuyo")

    # Update Masivo
    db.query(Animal).filter(
        Animal.id.in_(datos.animal_ids),
        Animal.campo_id == campo_id 
    ).update(
        {Animal.lote_id: datos.nuevo_lote_id}, 
        synchronize_session=False
    )
    
    db.commit()
    return {"mensaje": f"{len(datos.animal_ids)} animales movidos"}