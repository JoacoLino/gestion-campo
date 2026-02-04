from fastapi import APIRouter, Depends, HTTPException
from app.auth.auth_dependencies import obtener_usuario_actual
from app.models.users_models import User # Importamos el modelo User

router = APIRouter()

@router.get("/dashboard")
def protected_dashboard(user: User = Depends(obtener_usuario_actual)):
    # Como 'user' ya es el objeto validado, si llegamos aquí es que todo está bien.
    return {
        "mensaje": f"Bienvenido {user.name}",
        "user_id": user.id,
        "email": user.email
    }