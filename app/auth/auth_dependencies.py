"""from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.auth_utils import decodificar_token
from app.models.users_models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

#Funcion para obtener el usuario actual
def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = decodificar_token(token) #Decodifica el token y asi obtiene el email
    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.query(User).filter(User.email == email).first() #Busca en la base de datos el usuario segun el mail
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return user #Devuelve los datos del usuario segun el token

def obtener_usuario_actual(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    print("token recibido:",token)
    email = decodificar_token(token) #Decodifica el token y asi obtiene el email
    print("email:",email)
    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.query(User).filter(User.email == email).first() #Busca en la base de datos el usuario segun el mail
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return email #Devuelve los datos del usuario segun el token
"""

from fastapi import Request, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.auth_utils import decodificar_token, verificar_refresh_token, crear_token_acceso
from app.models.users_models import User

def obtener_usuario_actual(request: Request, response: Response, db: Session = Depends(get_db)):
    
    #request.cookies se usa para extraer la cookie de HTTP-only
    token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    print("Access token recibido:", token)
    print("Refresh token recibido:", refresh_token)

    email = None

    # 1. Intentar decodificar el access_token
    if token:
        try:
            email = decodificar_token(token)
        except Exception as e:
            print("Error al decodificar access token:", e)

    # 2. Si no hay email, intentar renovar con refresh_token
    if not email and refresh_token:
        try:
            user_refresh_token = verificar_refresh_token(refresh_token, db)
            print("Refresh token válido, generando nuevo access token para:", email)
            user = db.query(User).filter(User.refresh_tokens == user_refresh_token).first() 

            # Si es válido, generar y devolver nuevo access token // CAMBIAR PARA QUE PASE EL USER ID Y NO EL EMAIL
            nuevo_access_token = crear_token_acceso({"sub": str(user.email)})

            # Adjuntar el nuevo token en la respuesta
            response.set_cookie(key="access_token", value=nuevo_access_token, httponly=True)
        except Exception as e:
            print("Error al verificar refresh token:", e)
            raise HTTPException(status_code=401, detail="Token expirado o inválido")

    # 3. Si aún no hay email, rechazar la solicitud
    if not email:
        raise HTTPException(status_code=401, detail="No autorizado")

    # 4. Validar que el usuario exista en la base de datos
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return email
