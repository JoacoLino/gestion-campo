from sqlalchemy.orm import Session
from app.models.users_models import User
from app.schemas.user_schemas import UsuarioCreate
from hashlib import sha256

def crear_usuario(db: Session, usuario: UsuarioCreate):
    hashed_password = sha256(usuario.password.encode()).hexdigest()
    db_usuario = User(
        name=usuario.name,
        email=usuario.email,
        password=hashed_password,
        plan=usuario.plan
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario
