from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Lote(Base):
    __tablename__ = "lote"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)
    poligono = Column(String)
    cultivo = Column(String)
    # Clave foránea que hace referencia a 'id' de la tabla 'users'
    campo_id = Column(Integer, ForeignKey('farm.id'))

    # Relación inversa, asociando un campo con un usuario
    campo = relationship("Farm", back_populates="lotes")
    actividades = relationship("Actividad", back_populates="lote")
    #actividades = relationship("Actividad", back_populates="lote", cascade="all, delete-orphan")
