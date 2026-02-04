from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.auth_utils import decodificar_token
from app.models.users_models import User

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