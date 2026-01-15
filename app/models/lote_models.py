from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base
from sqlalchemy.orm import relationship

class Lote(Base):
    __tablename__ = "lotes" # <--- PLURAL (Para coincidir con Animales)

    id = Column(Integer, primary_key=True, index=True) # Usar index=True es mejor practica
    name = Column(String)
    superficie = Column(Float)
    cultivo = Column(String, nullable=True) # Puede estar vacío si hay vacas
    
    # FK apunta a la tabla 'campos'
    campo_id = Column(Integer, ForeignKey('campos.id')) 

    # RELACIONES
    # Un lote pertenece a UN campo (Singular)
    campo = relationship("Campo", back_populates="lotes")
    
    # Un lote tiene MUCHOS animales
    animales = relationship("Animal", back_populates="lote")
    
    # Un lote tiene MUCHAS actividades
    # Asegurate de importar Actividad o usar string "Actividad" si da error circular
    actividades = relationship("Actividad", back_populates="lote", cascade="all, delete-orphan")