from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.animal_schemas import AnimalCreate, AnimalResponse, MovimientoMasivo 
from app.models.campo_models import Campo
from app.models.animal_models import Animal
from app.models.users_models import User
from app.models.lote_models import Lote
from app.models.plan_models import Plan
# IMPORTANTE: Importamos la nueva validación maestra
from app.auth.auth_dependencies import obtener_usuario_actual, verificar_acceso_campo

router = APIRouter()

# --- GET: Listar Animales ---
@router.get("/{campo_id}/", response_model=List[AnimalResponse])
def read_animales(
    campo_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    # 👇 AQUÍ ESTÁ LA MAGIA: Esto valida si es dueño O empleado
    campo_validado: Campo = Depends(verificar_acceso_campo) 
):
    # Ya no hace falta llamar a validar_dueno_campo() manualmente.
    # Si llega acá, es porque tiene permiso.
    animales = db.query(Animal).filter(Animal.campo_id == campo_id).all()
    return animales

# --- POST: Crear Animal ---
@router.post("/{campo_id}/", response_model=AnimalResponse)
def create_new_animal(
    campo_id: int, 
    animal: AnimalCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual),
    campo_validado: Campo = Depends(verificar_acceso_campo) # <--- Validación Maestra
):
    # Lógica de Planes (se mantiene igual, pero ojo con el conteo)
    # NOTA: Para el límite de animales, deberíamos chequear el plan del DUEÑO del campo, no del peón.
    dueno_id = campo_validado.user_id 
    plan_dueno = db.query(Plan).join(User, User.plan_id == Plan.id).filter(User.id == dueno_id).first()

    total_animales = db.query(Animal).filter(Animal.campo_id == campo_id).count() # Contamos solo de este campo
    
    if plan_dueno and plan_dueno.max_animales != -1 and total_animales >= plan_dueno.max_animales:
        raise HTTPException(
            status_code=402, 
            detail=f"El dueño del campo alcanzó su límite ({plan_dueno.max_animales} animales)."
        )

    # Crear el animal
    nuevo_animal = Animal(**animal.dict(), campo_id=campo_id)
    db.add(nuevo_animal)
    db.commit()
    db.refresh(nuevo_animal)
    return nuevo_animal

# --- DELETE: Borrar Animal ---
@router.delete("/{animal_id}")
def delete_existing_animal(
    animal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    
    # Validamos el acceso al campo de este animal usando la misma lógica
    # (Aquí llamamos a la función manualmente porque no tenemos campo_id en la URL)
    verificar_acceso_campo(animal.campo_id, db, current_user)
    
    db.delete(animal)
    db.commit()
    return {"message": "Animal eliminado correctamente"}

# ... (El resto de endpoints sigue la misma lógica)