"""
Configuración de la autenticacion JWT.

Este archivo contiene todas las utilidades de la autenticacion:
"""


from passlib.context import CryptContext
from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from typing import Optional
import os # os: Se usa para acceder a variables de entorno del sistema.
from dotenv import load_dotenv
from app.schemas.refresh_token_schemas import RefreshTokenOut
from app.models.refresh_token_models import RefreshToken
from app.database import get_db

load_dotenv() #Carga el archivo .env

# Configuración

#Declaracion de variables

SECRET_KEY = os.getenv("SECRET_KEY") #Obtiene la Secret key pára generar el token
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY") #Agregar uno mas en .env 
ALGORITHM = "HS256" #Se define el algoritmo para usar en el hasheo
ACCESS_TOKEN_EXPIRE_MINUTES = 1 #Se define la cantidad de minutos que el token va a estar habilitado
#REFRESH_TOKEN_EXPIRE_DAYS = 7 #Se define la cantidad de minutos que el refresh token va a estar habilitado
REFRESH_TOKEN_EXPIRE_MINUTES = 1

if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definida en las variables de entorno")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#Se hashea la password para su uso y la base de datos
def hashear_password(password: str):
    return pwd_context.hash(password)

#Verifica que la password sea igual a la password que esta hasheada
def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


#--------- ACCES TOKEN ---------
#Se le pasa el user o mail a la funcion
def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy() #Agarra la info que pasamos en data
    #expire = datetime.now() + (expires_delta or timedelta(seconds=3)) #Definimos cuando va a expirar el token
    expire = datetime.now(timezone.utc) + timedelta(seconds=60* 10)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) #Hace el encode para devolver un token, el cual combina el user, cuando expira y la secret key

#Se le pasa un token y lo decodifica //CAMBIAR PARA QUE TRAIGA TAMBIEN EL TENANT ID
def decodificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) #Decodifica el token con la secret key
        return payload.get("sub") #Obtiene el valor de sub que es el user(email)
    except ExpiredSignatureError as e: #Verifica que no haya errores en JWT
        print("token expirado:", e)
        return None
    except JWTError as e: #Verifica que no haya errores en JWT
        print("Error al decodificar token:", e)
        return None

# ----- Refresh Tokens -----
#Crea el refresh token, es similar a la creacion de token pero con mas duracion y otra secret key
def crear_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    #expire = datetime.now() + (expires_delta or timedelta(seconds=10))
    expire = datetime.now(timezone.utc) + timedelta(seconds=60 * 10)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

#Decodifica el refresh token, es como el decodificador de token pero con otra secret key
def decodificar_refresh_token(token: str):
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
    
#Verifica el refresh token en la base de datos
def verificar_refresh_token(db: get_db, token: str):
    token_db = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if not token_db or token_db.revoked or token_db.expires_at < datetime.now():
        return None
    return token_db