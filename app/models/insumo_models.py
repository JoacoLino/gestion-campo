from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Insumo(Base):
    __tablename__ = "insumo"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)
    unidades = Column(Integer)
    stock = Column(Integer)
    # Clave foránea que hace referencia a 'id' de la tabla 'users'
    campo_id = Column(Integer, ForeignKey('campo.id'))

    # Relación inversa, asociando un campo con un usuario
    campos = relationship("Campo", back_populates="insumos")