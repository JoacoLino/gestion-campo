from app.database import engine, Base
# Importamos TODOS los modelos para asegurarnos de que SQLAlchemy los vea
from app.models.users_models import User
from app.models.campo_models import Campo
from app.models.lote_models import Lote
from app.models.animal_models import Animal
from app.models.sanidad_models import EventoSanitario
# Importamos el NUEVO modelo
from app.models.agenda_models import AgendaEvento 

from app.models.insumo_models import Insumo
from app.models.plan_models import Plan

print("Detectando nuevas tablas...")
# create_all es inteligente: Solo crea las tablas que NO existen.
# No borra ni modifica las que ya están.
Base.metadata.create_all(bind=engine)
print("✅ Base de datos actualizada con éxito.")