from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AgendaEvento(Base):
    __tablename__ = "agenda_eventos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True) # Ej: "Vacunación Aftosa"
    fecha = Column(Date, index=True)
    tipo = Column(String) # "Sanidad", "Manejo", "Administrativo", "Otro"
    descripcion = Column(String, nullable=True)
    completado = Column(Boolean, default=False)
    
    campo_id = Column(Integer, ForeignKey("campos.id"))
    
    # Relaciones (opcional, por ahora no la vinculamos directo a animales para hacerlo simple)
    campo = relationship("Campo", back_populates="eventos_agenda")