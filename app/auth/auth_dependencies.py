from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.auth_utils import decodificar_token
from app.models.users_models import User
from app.models.campo_models import Campo, CampoMiembro

# Función LIMPIA y RÁPIDA
def obtener_usuario_actual(request: Request, db: Session = Depends(get_db)):
    # 1. Obtenemos el token de la cookie
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")

    # 2. Decodificamos (obtenemos el email)
    email = decodificar_token(token)
    if not email:
        # Si el token expiró, lanzamos 401. 
        # El Frontend (Axios) interceptará esto y llamará a /refresh-token automáticamente.
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    # 3. Buscamos el usuario COMPLETO en la BD
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    # 4. ¡Devolvemos el OBJETO user, no solo el email!
    return user


# --- AGREGAR ESTA FUNCIÓN AL FINAL ---
def verificar_acceso_campo(
    campo_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(obtener_usuario_actual)
):
    """
    Verifica si el usuario tiene permiso para entrar al campo.
    Funciona tanto para el DUEÑO como para los EMPLEADOS.
    """
    # 1. Buscamos el campo
    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    # 2. ESTRATEGIA 1: ¿Es el dueño?
    if campo.user_id == current_user.id:
        return campo # ✅ Acceso concedido (Dueño)

    # 3. ESTRATEGIA 2: ¿Es empleado?
    es_miembro = db.query(CampoMiembro).filter(
        CampoMiembro.campo_id == campo_id,
        CampoMiembro.user_id == current_user.id
    ).first()

    if es_miembro:
        return campo # ✅ Acceso concedido (Empleado)

    # 4. Si no es ni dueño ni empleado:
    raise HTTPException(status_code=403, detail="⛔ No tienes permiso para acceder a este campo.")