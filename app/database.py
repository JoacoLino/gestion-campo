"""
Configuración de la base de datos para la aplicación FastAPI.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv  # <--- IMPORTANTE: Importamos dotenv

# 1. FORZAMOS A PYTHON A LEER EL ARCHIVO .env
load_dotenv() 

# 2. Buscamos la variable de entorno DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Render a veces devuelve la URL empezando con "postgres://", 
# pero SQLAlchemy moderna necesita "postgresql://"
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Si a pesar de leer el .env sigue sin haber URL, frenamos el programa para avisarte
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("¡ERROR! No se encontró DATABASE_URL. Verifica tu archivo .env")

# Ya sabemos que es Postgres (Local o Nube), así que no necesitamos connect_args especiales para SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()