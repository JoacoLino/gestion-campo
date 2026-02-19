from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.auth_utils import hashear_password
from app.models.users_models import User
from app.models.campo_models import Campo, CampoMiembro
from app.models.plan_models import Plan
from app.auth.auth_dependencies import obtener_usuario_actual

router = APIRouter()

class NuevoPeonSchema(BaseModel):
    nombre: str
    email: str # Usaremos email como "usuario"
    password: str

@router.post("/equipo/{campo_id}/crear")
def crear_peon(
    campo_id: int, 
    datos: NuevoPeonSchema, 
    db: Session = Depends(get_db),
    current_user: User = Depends(obtener_usuario_actual)
):
    # 1. Verificar si soy dueño (o encargado)
    # (Aquí podrías usar verificar_acceso_campo si quieres que un encargado agregue gente,
    # pero por seguridad dejemos que solo el dueño agregue personal por ahora).
    campo = db.query(Campo).filter(Campo.id == campo_id, Campo.user_id == current_user.id).first()
    if not campo:
        raise HTTPException(status_code=403, detail="Solo el dueño puede agregar personal.")

    # 2. VERIFICAR LIMITES DEL PLAN
    plan_dueño = db.query(Plan).filter(Plan.id == current_user.plan_id).first()
    cantidad_actual = db.query(CampoMiembro).filter(CampoMiembro.campo_id == campo_id).count()
    cupo_disponible = plan_dueño.max_usuarios - 1 
    
    if plan_dueño.max_usuarios != -1 and cantidad_actual >= cupo_disponible:
         raise HTTPException(status_code=402, detail="Límite de personal alcanzado. Mejora tu plan.")

    # 3. LÓGICA INTELIGENTE: ¿El usuario ya existe?
    usuario_existente = db.query(User).filter(User.email == datos.email).first()
    
    if usuario_existente:
        # --- CASO A: EL USUARIO YA EXISTE (Reutilizamos la cuenta) ---
        
        # Verificamos si YA está en este campo para no duplicarlo
        ya_es_miembro = db.query(CampoMiembro).filter(
            CampoMiembro.campo_id == campo_id,
            CampoMiembro.user_id == usuario_existente.id
        ).first()
        
        if ya_es_miembro:
            raise HTTPException(status_code=400, detail="Este usuario ya es parte del equipo de este campo.")
            
        # Si existe pero no está en este campo, LO VINCULAMOS.
        # IMPORTANTE: Ignoramos la password que envió el dueño, porque el peón ya tiene su propia clave.
        nuevo_miembro = CampoMiembro(campo_id=campo_id, user_id=usuario_existente.id, rol="peon")
        db.add(nuevo_miembro)
        db.commit()
        
        return {"message": f"Se vinculó a {usuario_existente.name} (cuenta existente) a este campo."}

    else:
        # --- CASO B: EL USUARIO NO EXISTE (Creamos cuenta nueva) ---
        
        nuevo_usuario = User(
            name=datos.nombre,
            email=datos.email,
            password=hashear_password(datos.password), # Usamos la pass que dio el dueño
            plan_id=1 
        )
        db.add(nuevo_usuario)
        db.commit() 
        db.refresh(nuevo_usuario)

        # Lo vinculamos
        nuevo_miembro = CampoMiembro(campo_id=campo_id, user_id=nuevo_usuario.id, rol="peon")
        db.add(nuevo_miembro)
        db.commit()

        return {"message": "Usuario creado y vinculado exitosamente."}
    
@router.get("/equipo/{campo_id}")
def listar_equipo(campo_id: int, db: Session = Depends(get_db), current_user: User = Depends(obtener_usuario_actual)):
    # Simple lista para mostrar en la tabla
    miembros = db.query(CampoMiembro).filter(CampoMiembro.campo_id == campo_id).all()
    # Retornamos los datos del usuario asociado
    return [
        {"id": m.usuario.id, "nombre": m.usuario.name, "email": m.usuario.email, "rol": m.rol} 
        for m in miembros
    ]