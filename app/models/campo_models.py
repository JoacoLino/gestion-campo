from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Campo(Base):
    __tablename__ = "campo"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)
    location = Column(String)
    # Clave foránea que hace referencia a 'id' de la tabla 'users'
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relación inversa, asociando un campo con un usuario
    users = relationship("User", back_populates="campo")
    lotes = relationship("Lote", back_populates="campo")
    insumos = relationship("Insumo", back_populates="campo")
    #insumos = relationship("Insumo", back_populates="campo", cascade="all, delete-orphan")
