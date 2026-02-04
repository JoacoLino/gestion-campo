from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Insumo(Base):
    __tablename__ = "insumos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True) # Ej: Ivermectina
    categoria = Column(String) # Sanidad, Suplemento, Alimento, Combustible
    stock = Column(Float, default=0.0)
    unidad = Column(String) # Litros, Dosis, Kg, Rollos
    costo_promedio = Column(Float, default=0.0) # Para calcular valor del stock
    
    campo_id = Column(Integer, ForeignKey("campos.id"))
    
    # Relación inversa (asegúrate de tenerla en campo_models.py si la necesitas)
    campo = relationship("Campo", back_populates="insumos")