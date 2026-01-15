from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class CategoriaAnimal(str, enum.Enum):
    VACA = "Vaca"
    TORO = "Toro"
    NOVILLO = "Novillo"
    TERNERO = "Ternero"
    VAQUILLONA = "Vaquillona"

class Animal(Base):
    __tablename__ = "animales"

    id = Column(Integer, primary_key=True, index=True)
    caravana = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    raza = Column(String, nullable=True)
    peso = Column(Float, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    
    # --- CORRECCIÓN CRÍTICA DE FOREIGN KEYS ---
    # Deben coincidir con los __tablename__ de los otros archivos
    campo_id = Column(Integer, ForeignKey("campos.id")) 
    lote_id = Column(Integer, ForeignKey("lotes.id"), nullable=True)

    # Relaciones
    campo = relationship("Campo", back_populates="animales")
    lote = relationship("Lote", back_populates="animales")