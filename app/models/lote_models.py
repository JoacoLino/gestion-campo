from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Lote(Base):
    __tablename__ = "lotes"
    
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)
    superficie = Column(String)
    activity = Column(String)
    
    # --- AGREGAR ESTA LÍNEA ---
    cultivo = Column(String) 
    
    campo_id = Column(Integer, ForeignKey('campos.id'))
    campo = relationship("Campo", back_populates="lotes")
    animales = relationship("Animal", back_populates="lote")
    actividades = relationship("Actividad", back_populates="lote")