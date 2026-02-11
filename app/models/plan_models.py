from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base
from sqlalchemy.orm import relationship

class Plan(Base):
    __tablename__ = "planes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True) # "Productor", "Establecimiento", "Estancia"
    precio_mensual = Column(Float, default=0.0)
    
    # --- LOS LÍMITES DUROS ---
    max_campos = Column(Integer, default=1)
    max_animales = Column(Integer, default=100)
    
    usuarios = relationship("User", back_populates="plan")