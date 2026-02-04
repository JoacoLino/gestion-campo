from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from app.models.users_models import User
from app.models.refresh_token_models import RefreshToken
from app.schemas.user_schemas import UsuarioCreate
from app.auth.auth_utils import (
    hashear_password, verificar_password, crear_token_acceso, crear_refresh_token
)
from datetime import timedelta, datetime, timezone # <--- Importante: timezone
from fastapi.responses import JSONResponse

router = APIRouter()

# REGISTRO
@router.post("/registro")
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == usuario.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    nuevo_user = User(
        name=usuario.name,
        email=usuario.email,
        password=hashear_password(usuario.password)
    )
    db.add(nuevo_user)
    db.commit()
    db.refresh(nuevo_user)
    return {"mensaje": "Usuario creado exitosamente"}

# LOGIN
@router.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verificar_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # 1. Crear Refresh Token con expiración en UTC
    refresh_token = crear_refresh_token({"sub": str(user.id)})
    
    # CORRECCIÓN 1: Usar timezone.utc para evitar conflicto horario Argentina vs Mundo
    expira_en = datetime.now(timezone.utc) + timedelta(days=7)

    # 2. Guardar en Base de Datos
    db_refresh = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=expira_en,
        is_active=True # Nos aseguramos que nazca activo
    )
    db.add(db_refresh)
    db.commit()
    db.refresh(db_refresh)

    # 3. Crear Access Token
    access_token = crear_token_acceso({"sub": str(user.email)}) # O user.id si prefieres

    # 4. Devolver respuesta con Cookies
    response = JSONResponse(
        content={
            "access_token": access_token,
            "token_type": "bearer"
        }
    )

    # CORRECCIÓN 2: secure=False para que funcione en localhost
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, # <--- False en desarrollo
        samesite="lax",
        max_age=60 * 15 # 15 minutos
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False, # <--- False en desarrollo
        samesite="lax",
        max_age=60 * 60 * 24 * 7 # 7 días
    )

    return response

# REFRESH TOKEN
@router.post("/refresh-token")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    # 1. Leer cookie
    refresh_token_cookie = request.cookies.get("refresh_token")
    if not refresh_token_cookie:
        raise HTTPException(status_code=401, detail="Refresh token no encontrado en cookies")

    # 2. Buscar en BD
    token_db = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_cookie).first()
    
    # 3. Validar
    if not token_db:
        raise HTTPException(status_code=401, detail="Refresh token no existe en BD")
    
    if not token_db.is_active:
        raise HTTPException(status_code=401, detail="Refresh token revocado")
        
    # Comparación UTC vs UTC (Ahora sí funciona)
    if token_db.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token expirado")

    # 4. Obtener usuario
    user = db.query(User).filter(User.id == token_db.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    # 5. Rotación de tokens (Opcional: Revocar el viejo y dar uno nuevo)
    # Para simplificar y evitar errores de concurrencia ahora, podemos mantener el refresh y solo dar nuevo access
    # O revocar y dar nuevo (Lógica de rotación):
    token_db.is_active = False # Revocamos el usado
    
    nuevo_refresh_token = crear_refresh_token({"sub": str(user.id)})
    nuevo_expira = datetime.now(timezone.utc) + timedelta(days=7)
    
    nuevo_db_refresh = RefreshToken(
        token=nuevo_refresh_token,
        user_id=user.id,
        expires_at=nuevo_expira,
        is_active=True
    )
    db.add(nuevo_db_refresh)
    
    # 6. Nuevo Access Token
    nuevo_access_token = crear_token_acceso({"sub": str(user.email)})
    
    db.commit()

    # 7. Respuesta
    response = JSONResponse(content={"access_token": nuevo_access_token, "token_type": "bearer"})
    
    # Seteamos cookies nuevamente
    response.set_cookie(
        key="access_token",
        value=nuevo_access_token,
        httponly=True,
        secure=False, # <--- False en local
        samesite="lax",
        max_age=60 * 15
    )
    
    response.set_cookie(
        key="refresh_token",
        value=nuevo_refresh_token,
        httponly=True,
        secure=False, # <--- False en local
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )
    
    return response

# LOGOUT
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"mensaje": "Sesión cerrada"}