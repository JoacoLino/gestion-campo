from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.auth_utils import verificar_refresh_token  # función para decodificar el token
from app.auth.auth_utils import decodificar_token
from app.auth.auth_dependencies import obtener_usuario_actual

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth_routes/login")

  # NO verificar_refresh_token

@router.get("/dashboard")

def protected_dashboard(user_email: str = Depends(obtener_usuario_actual)):
    try:
        if not user_email:
            raise HTTPException(status_code=401, detail="Token inválido o expirado")
        return {"mensaje": f"Hola usuario {user_email}, bienvenido al dashboard protegido."}
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

#@router.get("/dashboard")
#def protected_dashboard():
#    return {"mensaje": "Hola, dashboard sin protección temporal"}
