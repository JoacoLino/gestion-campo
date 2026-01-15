from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Actividad(Base):
    __tablename__ = "actividad"
    id = Column(Integer, primary_key=True, unique=True)
    tipo = Column(String)
    fecha = Column(Date)
    notas = Column(String)
    # Clave foránea que hace referencia a 'id' de la tabla 'users'
    lote_id = Column(Integer, ForeignKey('lotes.id'))

    # Relación inversa, asociando un campo con un usuario
    lote = relationship("Lote", back_populates="actividades")