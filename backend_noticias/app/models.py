from sqlalchemy import Column, Integer, String, Text, Date, DateTime, UniqueConstraint, Index
from sqlalchemy.sql import func
from .database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, index=True, nullable=False)

class Noticia(Base):
    __tablename__ = "noticias"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(500), nullable=False)
    enlace = Column(String(500), unique=True, nullable=False)  # Reducido de 1000 a 500
    fecha = Column(Date, nullable=False)
    categoria = Column(String(50), nullable=False)
    contenido = Column(Text, nullable=True)
    imagen_url = Column(String(500), nullable=True)  # Reducido de 1000 a 500
    fuente = Column(String(50), nullable=False)
    fecha_creacion = Column(DateTime, default=func.now())
    
    # Índice para búsquedas por categoría
    __table_args__ = (
        UniqueConstraint('enlace', name='uq_enlace'),
        Index('idx_categoria', 'categoria'),
        Index('idx_fuente', 'fuente'),
        Index('idx_fecha', 'fecha')
    )