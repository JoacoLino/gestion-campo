from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class CampoMiembro(Base):
    __tablename__ = "campo_miembros"

    id = Column(Integer, primary_key=True, index=True)
    campo_id = Column(Integer, ForeignKey("campos.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id")) 
    rol = Column(String, default="peon") # 'admin', 'peon'

    # Relaciones (opcionales, ayudan a navegar los datos)
    campo = relationship("Campo", back_populates="miembros")
    usuario = relationship("User") 

# IMPORTANTE: Agrega esto dentro de tu clase Campo existente:
# miembros = relationship("CampoMiembro", back_populates="campo")


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
    eventos_agenda = relationship("AgendaEvento", back_populates="campo")
    miembros = relationship("CampoMiembro", back_populates="campo", cascade="all, delete-orphan")