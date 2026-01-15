"""
Configuración de la autenticacion JWT.

Este archivo contiene todos los routers de la autenticacion:
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from app.models.users_models import User
from app.models.refresh_token_models import RefreshToken
#Aca me parece que deberia de usar Token y Refresh Token. Esto podria ser una solucion a que no me anda el Refresh Token
from app.schemas.token_schemas import Token
#from app.schemas.refresh_token_schemas import RefreshTokenOut
from app.schemas.user_schemas import UsuarioCreate
from app.auth.auth_utils import (
    hashear_password, verificar_password, crear_token_acceso, crear_refresh_token
)
from datetime import timedelta, datetime
from fastapi.responses import JSONResponse

from fastapi import Response # Asegurate de importar Response

router = APIRouter()
""""
#Funcion que agarra lo que el usuario pone para registrarse y crea el ususario en la base de datos
@router.post("/registro", response_model=Token)
def registrar_usuario(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first() #Busca que el usuario no exista actualmente en la base de datos
    if user:
        raise HTTPException(status_code=400, detail="Email ya registrado") #Si encuentra un usuario debuelve un error

    #Crea una variable para guardar la informacion que el usuario escribio
    nuevo_user = User(
        name=form_data.username,
        email=form_data.username,
        password=hashear_password(form_data.password) #Hashea la password para mayor seguridad
    )
    db.add(nuevo_user) #Agrega el nuevo user en la base de datos
    db.commit() #Actualiza la base de datos
    db.refresh(nuevo_user)

    token = crear_token_acceso({"sub": nuevo_user.email}) #Crea el token mediante el email del usuario
    return {"access_token": token, "token_type": "bearer"} #Devuelve el token que certifica el registro por 1 minuto
"""
#Funcion que agarra lo que el usuario pone para registrarse y crea el ususario en la base de datos
#@router.post("/registro", response_model=Token)
@router.post("/registro")
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    print(usuario)
    user = db.query(User).filter(User.email == usuario.email).first() #Busca que el usuario no exista actualmente en la base de datos
    if user:
        raise HTTPException(status_code=400, detail="Email ya registrado") #Si encuentra un usuario debuelve un error

    #Crea una variable para guardar la informacion que el usuario escribio
    nuevo_user = User(
        name=usuario.name,
        email=usuario.email,
        password=hashear_password(usuario.password) #Hashea la password para mayor seguridad
    )
    db.add(nuevo_user) #Agrega el nuevo user en la base de datos
    db.commit() #Actualiza la base de datos
    db.refresh(nuevo_user)


    return
    #refresh_token = crear_refresh_token({"sub": nuevo_user.email})
    #token = crear_token_acceso({"sub": nuevo_user.email}) #Crea el token mediante el email del usuario
    #return {"access_token": token, "refresh_token": refresh_token,  "token_type": "bearer"} #Devuelve el token que certifica el registro por 1 minuto
    #Necesito pasarle el refresh token porque asi lo puse en el schema de token, aunque no haga falta


#Funcion que agarra lo que el usuario pone para iniciar sesion
@router.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first() #Busca el usuario en la base de datos
    if not user or not verificar_password(form_data.password, user.password): #Si no se encuentra el usuario o la contraseña esta mal devuelve un error
        raise HTTPException(status_code=401, detail="Credenciales inválidas") 

    # Después de verificar el usuario:
    refresh_token = crear_refresh_token({"sub": str(user.id)})
    #xpira_en = datetime.now() + timedelta(days=7)
    expira_en = datetime.now() + timedelta(seconds= 60 *10)

    db_refresh = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=expira_en
    )
    db.add(db_refresh)
    db.commit()
    db.refresh(db_refresh)


    token = crear_token_acceso({"sub": str(user.email)}) #Crea el token de autenticacion mediante el email //CAMBIAR PARA QUE LO CREE CON EL USER ID Y NO CON EL MAIL
    print("LOGIN OK", token, refresh_token)
    print("Password correcta:", verificar_password(form_data.password, user.password))

    
    # Guardar el access token como cookie HTTP-only
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,        # ⚠️ Asegurate de usar HTTPS en producción
        samesite="Lax",     # o "Strict" si querés evitar CSRF
        max_age= 60*10,    # 15 minutos, o lo que definas como duración // Duracion del acces token en segundos
        path="/"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,        # ⚠️ Asegurate de usar HTTPS en producción
        samesite="Lax",     # o "Strict" si querés evitar CSRF
        max_age= 60 * 10,    # 15 minutos, o lo que definas como duración
        path="/"
    )

    #return response
    #return {"access_token": token, "refresh_token": refresh_token,  "token_type": "bearer"}
    return JSONResponse(
        content={
            "access_token": token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        },
        headers=response.headers
    )


@router.post("/logout")
def logout(response: Response):
    # Esto le dice al navegador: "Borra estas cookies YA"
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token") # Si usas refresh token también
    return {"mensaje": "Sesión cerrada exitosamente"}
