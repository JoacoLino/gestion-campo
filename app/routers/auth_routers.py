from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.auth.auth_utils import crear_refresh_token, decodificar_refresh_token  # Ajustá import según tu estructura
from datetime import timedelta
from app.schemas.refresh_token_schemas import RefreshTokenOut
from app.models.users_models import User
from app.database import get_db
from datetime import datetime, timezone
from app.auth.auth_utils import crear_refresh_token, crear_token_acceso
from sqlalchemy.orm import Session
from app.models.refresh_token_models import RefreshToken

router = APIRouter()

class RefreshTokenRequest(BaseModel):
    refresh_token: str

#@router.post("/refresh-token")
#def refresh_token(data: RefreshTokenRequest):
#    user_id = decodificar_refresh_token(data.refresh_token)
#    if not user_id:
#        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")
#
#    nuevo_token = crear_refresh_token(
#        data={"sub": user_id},
#        expires_delta=timedelta(minutes=60)
#    )
#    return {"access_token": nuevo_token, "token_type": "bearer"}


@router.post("/refresh-token")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    # 1. Buscar el refresh token en la base de datos
    refresh_token_cookie = request.cookies.get("refresh_token")
    #token_db = db.query(RefreshTokenOut).filter(RefreshTokenOut.token == refresh_token_cookie).first()
    token_db = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_cookie).first()
    print("refreshtoken encontrado:", token_db)
    if not token_db or token_db.is_active == False or token_db.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")

    # 2. Obtener el usuario
    user = db.query(User).filter(User.id == token_db.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 3. Revocar el token viejo
    token_db.is_active = False
    db.commit()

    # 4. Crear un nuevo refresh token
    nuevo_refresh_token = crear_refresh_token({"sub": str(user.id)})
    expira_en = datetime.now(timezone.utc) + timedelta(days=7)

    nuevo_refresh = RefreshTokenOut(
        token=nuevo_refresh_token,
        user_id=user.id,
        expires_at=expira_en,
        is_active=True
    )
    db.add(nuevo_refresh)

    # 5. Crear un nuevo access token
    nuevo_access_token = crear_token_acceso(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=15)
    )

    db.commit()

    response = JSONResponse(content={
        "access_token": nuevo_access_token,
        "token_type": "bearer"
    })

    response.set_cookie(
        key="access_token",
        value=nuevo_access_token,
        httponly=True,  # 🔒
        samesite="lax",  # o "strict" según necesites
        secure=False     # 🔴 True si usás HTTPS
    )

    response.set_cookie(
        key="refresh_token",
        value=nuevo_refresh_token,
        httponly=True,  # 🔒
        samesite="lax",  # o "strict" según necesites
        secure=False     # 🔴 True si usás HTTPS
    )

    return response

    #return {
     #   "access_token": nuevo_access_token,
      #  "refresh_token": nuevo_refresh_token,
       # "token_type": "bearer"
    #}


