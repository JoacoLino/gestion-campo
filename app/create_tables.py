from database import Base, engine
from models import users_models, campo_models, lote_models, actividad_models, insumo_models, refresh_token_models  # importa todos los modelos

# Crea todas las tablas en la base de datos
print("Creando tablas...")
Base.metadata.create_all(bind=engine)
print("¡Listo! Tablas creadas.")
