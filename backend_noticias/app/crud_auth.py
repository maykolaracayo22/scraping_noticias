from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import logging
from . import models, schemas_auth
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

def obtener_usuario_por_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def crear_usuario(db: Session, usuario: schemas_auth.UsuarioCreate):
    # Verificar si el usuario ya existe
    db_usuario = obtener_usuario_por_email(db, usuario.email)
    if db_usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario (siempre como 'user' y 'free')
    hashed_password = models.Usuario.hash_password(usuario.password)
    db_usuario = models.Usuario(
        email=usuario.email,
        password_hash=hashed_password,
        nombre=usuario.nombre,
        rol="user",  # Siempre user en registro
        plan="free"  # Siempre free por defecto
    )
    
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def autenticar_usuario(db: Session, email: str, password: str):
    usuario = obtener_usuario_por_email(db, email)
    if not usuario:
        return False
    if not usuario.verificar_password(password):
        return False
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return usuario

def crear_usuario_admin_inicial(db: Session):
    """Crear usuario admin por defecto si no existe"""
    admin_email = "admin@newsperu.com"
    admin = obtener_usuario_por_email(db, admin_email)
    
    if not admin:
        hashed_password = models.Usuario.hash_password("123456")
        admin = models.Usuario(
            email=admin_email,
            password_hash=hashed_password,
            nombre="Administrador",
            rol="admin",
            plan="plus"  # Admin siempre tiene plan plus
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("✅ Usuario admin creado: admin@newsperu.com / 123456")
    
    return admin

# CORREGIR ESTA FUNCIÓN - Quitar 'self' y corregir imports
def obtener_estadisticas_usuarios(db: Session) -> dict:
    """Obtiene estadísticas de usuarios"""
    try:
        total_usuarios = db.query(models.Usuario).count()
        
        # Para usuarios activos - usar todos por ahora ya que no tenemos ultimo_login
        usuarios_activos = total_usuarios
        
        # Para nuevos usuarios - usar todos ya que no tenemos fecha_registro
        nuevos_usuarios = total_usuarios
        
        usuarios_plus = db.query(models.Usuario).filter(
            models.Usuario.plan == 'plus'
        ).count()
        
        return {
            'total_usuarios': total_usuarios,
            'usuarios_activos': usuarios_activos,
            'nuevos_usuarios': nuevos_usuarios,
            'usuarios_plus': usuarios_plus
        }
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de usuarios: {e}")
        return {
            'total_usuarios': 0,
            'usuarios_activos': 0,
            'nuevos_usuarios': 0,
            'usuarios_plus': 0
        }