from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user_schemas import UsuarioCreate, UsuarioOut
from app.crud.user_crud import crear_usuario

router = APIRouter()

@router.post("/", response_model=UsuarioOut)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    return crear_usuario(db, usuario)
