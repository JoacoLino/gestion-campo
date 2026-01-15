from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Campo(Base):
    __tablename__ = "campos" # <--- PLURAL

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    
    user_id = Column(Integer, ForeignKey('users.id')) # Apunta a tabla 'users'

    # Relación inversa: Un campo tiene UN dueño
    user = relationship("User", back_populates="campos") # Cambiado users -> user (es un solo dueño)

    # Relaciones de propiedad: Un campo tiene MUCHOS...
    lotes = relationship("Lote", back_populates="campo", cascade="all, delete-orphan")
    animales = relationship("Animal", back_populates="campo", cascade="all, delete-orphan")
    insumos = relationship("Insumo", back_populates="campo", cascade="all, delete-orphan")