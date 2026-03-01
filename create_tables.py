import sys
# Fuerza a la consola a usar UTF-8 para soportar emojis


# create_tables.py (Guardalo en la raíz del proyecto)
from app.database import Base, engine
from app.models import (
    users_models, 
    campo_models, 
    lote_models, 
    animal_models,
    actividad_models, 
    insumo_models, 
    refresh_token_models,
    sanidad_models,
    agenda_models,
    plan_models,
    
)


sys.stdout.reconfigure(encoding='utf-8')
def init_db():
    print("Eliminando tablas existentes...")
    try:
        # Esto borra TODO para empezar limpio (ideal para desarrollo)
        Base.metadata.drop_all(bind=engine)
        print("Tablas eliminadas.")
    except Exception as e:
        print(f"Advertencia: {e}")

    print("🏗️  Creando nuevas tablas (incluyendo Animales)...")
    Base.metadata.create_all(bind=engine)
    print("¡Base de datos y tablas creadas con éxito!")

if __name__ == "__main__":
    init_db()