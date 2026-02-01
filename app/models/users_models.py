from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship
from app.models.refresh_token_models import RefreshToken

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    plan = Column(Integer)

    # --- CORRECCIÓN ---
    # Antes: farm = relationship("Farm", back_populates="users")
    # Ahora debe coincidir con la relación definida en Campo (back_populates="user")
    campos = relationship("Campo", back_populates="user")
    
    refresh_tokens = relationship("RefreshToken", back_populates="users")

