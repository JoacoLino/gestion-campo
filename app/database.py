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

# Importaciones necesarias
from sqlalchemy import create_engine # create_engine: Crea la conexión entre tu código y la base de datos.
from sqlalchemy.orm import declarative_base # declarative_base: Se usa para crear clases que representan tablas (ORM).
from sqlalchemy.orm import sessionmaker # sessionmaker: Crea sesiones de trabajo con la base de datos.
import os # os: Se usa para acceder a variables de entorno del sistema.
from dotenv import load_dotenv # load_dotenv: Carga automáticamente las variables definidas en un archivo .env.
from sqlalchemy import text # text: Permite ejecutar comandos SQL crudos con SQLAlchemy 2.0+.


load_dotenv() #Carga el archivo .env

DATABASE_URL = os.getenv("DATABASE_URL") #Obtiene la variable del entorno

#DATABASE_URL= "postgresql://postgres:123456@localhost:5432/gestion_campo_db"


engine = create_engine(DATABASE_URL) #Crea el engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #Crea una sesion para escribir y leer datos
Base = declarative_base() #Todas las clases (modelos) que representan las tablas deben heredar de esta Base, así SQLAlchemy puede mapear objetos Python a tablas reales.

# Dependencia para obtener la sesión de DB
# Esta función se usa en FastAPI con Depends para crear sesiones automáticamente
def get_db(): 
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
