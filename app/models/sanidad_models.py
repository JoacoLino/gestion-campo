from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class EventoSanitario(Base):
    __tablename__ = "eventos_sanitarios"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    tipo = Column(String, nullable=False)
    producto = Column(String, nullable=True)
    notas = Column(Text, nullable=True)     
    costo_total = Column(Integer, default=0) 

    # 1. Campo: Si se borra el campo, sí queremos borrar los eventos (CASCADE)
    campo_id = Column(Integer, ForeignKey("campos.id"))
    campo = relationship("Campo")

    # 2. Animal: Si se borra el animal, mantenemos el evento pero ponemos NULL (SET NULL)
    # --- CAMBIO AQUÍ ---
    animal_id = Column(Integer, ForeignKey("animales.id", ondelete="SET NULL"), nullable=True)
    # -------------------
    
    animal = relationship("Animal")