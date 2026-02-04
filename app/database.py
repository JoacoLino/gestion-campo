"""
Configuración de la base de datos para la aplicación FastAPI.

Este archivo se encarga de:
- Cargar la URL de conexión desde un archivo .env
- Crear el motor (engine) de conexión a PostgreSQL
- Definir la base de modelos ORM con SQLAlchemy
- Crear una sesión reutilizable para las consultas a la base
- Incluir una función 'get_db' para usar como dependencia en FastAPI

Requiere:
- archivo .env con la variable DATABASE_URL definida
- instalación de las librerías: sqlalchemy, python-dotenv, psycopg2
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Buscamos la variable de entorno DATABASE_URL (La que nos dará Render)
# Si no existe, usamos la local sqlite (para que siga funcionando en tu PC)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Render a veces devuelve la URL empezando con "postgres://", 
# pero SQLAlchemy moderna necesita "postgresql://"
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not SQLALCHEMY_DATABASE_URL:
    # MODO LOCAL
    SQLALCHEMY_DATABASE_URL = "sqlite:///./gestion_campo.db"
    connect_args = {"check_same_thread": False} # Solo para SQLite
else:
    # MODO NUBE (Postgres)
    connect_args = {} 

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()