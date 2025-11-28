from sqlalchemy import Column, Integer, String, Text, Date, DateTime, UniqueConstraint, Index, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from passlib.context import CryptContext

from .database import Base

# Contexto para hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, index=True, nullable=False)

class Noticia(Base):
    __tablename__ = "noticias"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(500), nullable=False)
    enlace = Column(String(500), unique=True, nullable=False)
    fecha = Column(Date, nullable=False)
    categoria = Column(String(50), nullable=False)
    contenido = Column(Text, nullable=True)
    imagen_url = Column(String(500), nullable=True)
    fuente = Column(String(50), nullable=False)
    fecha_creacion = Column(DateTime, default=func.now())
    subreddit = Column(String(100), nullable=True)
    
    # Relaciones
    reportes = relationship("ReporteNoticia", back_populates="noticia", cascade="all, delete-orphan")
    analisis_ia = relationship("AnalisisIA", back_populates="noticia", uselist=False, cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint('enlace', name='uq_enlace'),
        Index('idx_categoria', 'categoria'),
        Index('idx_fuente', 'fuente'),
        Index('idx_fecha', 'fecha'),
        Index('idx_subreddit', 'subreddit'),
        Index('idx_fuente_fecha', 'fuente', 'fecha')
    )

class ReporteNoticia(Base):
    __tablename__ = "reportes_noticias"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    noticia_id = Column(Integer, ForeignKey("noticias.id"), nullable=False)
    motivo = Column(Text, nullable=False)
    estado = Column(String(20), default="pendiente")
    fecha_reporte = Column(DateTime, default=func.now())
    fecha_revision = Column(DateTime, nullable=True)
    notas_admin = Column(Text, nullable=True)
    
    noticia = relationship("Noticia", back_populates="reportes")
    
    __table_args__ = (
        Index('idx_reporte_estado', 'estado'),
        Index('idx_reporte_fecha', 'fecha_reporte'),
    )

# ✅ NUEVO: Modelo para Análisis IA
class AnalisisIA(Base):
    __tablename__ = "analisis_ia"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    noticia_id = Column(Integer, ForeignKey("noticias.id"), nullable=False, unique=True)
    resumen = Column(Text, nullable=False)
    categoria = Column(String(50), nullable=False)
    sentimiento = Column(String(20), nullable=False)  # positivo, negativo, neutral
    temas_principales = Column(JSON, nullable=False)  # Lista de temas
    puntuacion_importancia = Column(Integer, nullable=False)  # 1-10
    palabras_clave = Column(JSON, nullable=False)  # Lista de palabras clave
    fecha_analisis = Column(DateTime, default=func.now())
    
    # Relación con la noticia
    noticia = relationship("Noticia", back_populates="analisis_ia")
    
    __table_args__ = (
        Index('idx_analisis_noticia', 'noticia_id'),
        Index('idx_analisis_categoria', 'categoria'),
        Index('idx_analisis_sentimiento', 'sentimiento'),
        Index('idx_analisis_fecha', 'fecha_analisis'),
    )

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nombre = Column(String(100), nullable=False)
    rol = Column(String(20), default="user")  # 'user' o 'admin'
    plan = Column(String(20), default="free")  # 'free' o 'plus'
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=func.now())
    fecha_actualizacion = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relación con solicitudes de upgrade
    solicitudes_upgrade = relationship("SolicitudUpgrade", back_populates="usuario")
    
    __table_args__ = (
        Index('idx_usuario_email', 'email'),
        Index('idx_usuario_rol', 'rol'),
        Index('idx_usuario_plan', 'plan'),
    )
    
    def verificar_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password_hash)
    
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

class SolicitudUpgrade(Base):
    __tablename__ = "solicitudes_upgrade"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    plan_solicitado = Column(String(20), nullable=False)  # 'plus'
    codigo_yape = Column(String(6), nullable=False)  # Código de 6 dígitos
    monto = Column(Integer, nullable=False)  # 1990 para S/ 19.90 (en centimos)
    estado = Column(String(20), default="pendiente")  # pendiente, aprobado, rechazado
    fecha_solicitud = Column(DateTime, default=func.now())
    fecha_revision = Column(DateTime, nullable=True)
    notas_admin = Column(Text, nullable=True)
    
    # Relación con el usuario
    usuario = relationship("Usuario", back_populates="solicitudes_upgrade")
    # Relación con pagos
    pagos = relationship("Pago", back_populates="solicitud_upgrade")
    
    __table_args__ = (
        Index('idx_solicitud_estado', 'estado'),
        Index('idx_solicitud_fecha', 'fecha_solicitud'),
        Index('idx_solicitud_usuario', 'usuario_id'),
    )

class Pago(Base):
    __tablename__ = "pagos"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    solicitud_upgrade_id = Column(Integer, ForeignKey("solicitudes_upgrade.id"), nullable=False)
    monto = Column(Integer, nullable=False)
    moneda = Column(String(10), default="PEN")
    metodo_pago = Column(String(50), default="yape")
    estado = Column(String(20), default="completado")
    fecha_pago = Column(DateTime, default=func.now())
    codigo_confirmacion = Column(String(6), nullable=False)
    
    # Relación con la solicitud
    solicitud_upgrade = relationship("SolicitudUpgrade", back_populates="pagos")
    
    __table_args__ = (
        Index('idx_pago_fecha', 'fecha_pago'),
        Index('idx_pago_solicitud', 'solicitud_upgrade_id'),
    )