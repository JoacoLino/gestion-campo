import bcrypt
from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from typing import Optional
import os 
from dotenv import load_dotenv
from app.models.refresh_token_models import RefreshToken
from app.database import get_db

load_dotenv()

# --- Configuración y Variables ---
SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1  # Restaurado a tu valor original
REFRESH_TOKEN_EXPIRE_MINUTES = 1 # Restaurado a tu valor original

if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definida en las variables de entorno")

# --- Funciones de Password (Ahora sin passlib para evitar el error de 72 bytes) ---

def hashear_password(password: str):
    """Se hashea la password para su uso y la base de datos."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verificar_password(plain_password, hashed_password):
    """Verifica que la password sea igual a la password que esta hasheada."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

# --------- ACCESS TOKEN ---------

def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    # Usamos tu lógica de 10 minutos o el delta que pases
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=10))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decodificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except ExpiredSignatureError as e:
        print("token expirado:", e)
        return None
    except JWTError as e:
        print("Error al decodificar token:", e)
        return None

# ----- Refresh Tokens -----

def crear_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=10))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def decodificar_refresh_token(token: str):
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
    
def verificar_refresh_token(db, token: str):
    """Verifica el refresh token en la base de datos."""
    token_db = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if not token_db or token_db.revoked or token_db.expires_at < datetime.now():
        return None
    return token_db