from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar routers
from app.routers import (
    auth_routers,
    user_routers,
    campo_routers,
    lote_routers,
    insumo_routers,
    actividad_routers,
    protecter_routers
)
from app.auth import auth_routes

app = FastAPI()

# Configuración de CORS para permitir conexión con el frontend (por ejemplo en http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Reemplazá con la URL de tu frontend si cambia
    allow_credentials=True,
    #allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(auth_routers.router, prefix="/auth", tags=["Autenticación"])
app.include_router(user_routers.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(campo_routers.router, prefix="/campos", tags=["Campos"])
app.include_router(lote_routers.router, prefix="/lotes", tags=["Lotes"])
app.include_router(insumo_routers.router, prefix="/insumos", tags=["Insumos"])
app.include_router(actividad_routers.router, prefix="/actividades", tags=["Actividades"])
app.include_router(auth_routes.router, prefix="/auth_routes", tags=["Rutas Autenticacion"])
app.include_router(protecter_routers.router, prefix="/protecter_routers") 
for route in app.routes:
    print(f"{route.path} - {route.methods}")


# Ruta raíz opcional
@app.get("/")
def read_root():
    return {"mensaje": "API del sistema de gestión agrícola funcionando."}


