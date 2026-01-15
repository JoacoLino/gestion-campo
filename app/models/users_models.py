from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship
from app.models.refresh_token_models import RefreshToken  # importa la clase explícitamente


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    plan = Column(Integer)


    # Relación uno a muchos (un usuario puede tener muchos campos)
    campos = relationship("Campo", back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="users")

