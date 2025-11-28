from sqlalchemy.orm import Session
from . import models
from fastapi import HTTPException, status

def crear_solicitud_upgrade(db: Session, solicitud_data: dict):
    # Verificar que el usuario existe
    usuario = db.query(models.Usuario).filter(models.Usuario.id == solicitud_data['usuario_id']).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar que no tenga una solicitud pendiente
    solicitud_pendiente = db.query(models.SolicitudUpgrade).filter(
        models.SolicitudUpgrade.usuario_id == solicitud_data['usuario_id'],
        models.SolicitudUpgrade.estado == 'pendiente'
    ).first()
    
    if solicitud_pendiente:
        raise HTTPException(
            status_code=400, 
            detail="Ya tienes una solicitud de upgrade pendiente"
        )
    
    # Crear la solicitud
    db_solicitud = models.SolicitudUpgrade(**solicitud_data)
    db.add(db_solicitud)
    db.commit()
    db.refresh(db_solicitud)
    
    # Crear registro de pago
    pago_data = {
        'solicitud_upgrade_id': db_solicitud.id,
        'monto': solicitud_data['monto'],
        'codigo_confirmacion': solicitud_data['codigo_yape']
    }
    
    db_pago = models.Pago(**pago_data)
    db.add(db_pago)
    db.commit()
    
    return db_solicitud

def obtener_solicitudes_upgrade(db: Session, skip: int = 0, limit: int = 100, estado: str = None):
    query = db.query(models.SolicitudUpgrade)
    
    if estado:
        query = query.filter(models.SolicitudUpgrade.estado == estado)
    
    return query.offset(skip).limit(limit).all()

def obtener_solicitud_upgrade_por_id(db: Session, solicitud_id: int):
    return db.query(models.SolicitudUpgrade).filter(models.SolicitudUpgrade.id == solicitud_id).first()

def actualizar_solicitud_upgrade(db: Session, solicitud_id: int, solicitud_data: dict):
    db_solicitud = obtener_solicitud_upgrade_por_id(db, solicitud_id)
    if not db_solicitud:
        return None
    
    for key, value in solicitud_data.items():
        setattr(db_solicitud, key, value)
    
    db_solicitud.fecha_revision = models.func.now()
    db.commit()
    db.refresh(db_solicitud)
    
    # Si se aprueba, actualizar el plan del usuario
    if solicitud_data.get('estado') == 'aprobado':
        usuario = db.query(models.Usuario).filter(models.Usuario.id == db_solicitud.usuario_id).first()
        if usuario:
            usuario.plan = db_solicitud.plan_solicitado
            db.commit()
    
    return db_solicitud

def obtener_solicitudes_por_usuario(db: Session, usuario_id: int):
    return db.query(models.SolicitudUpgrade).filter(
        models.SolicitudUpgrade.usuario_id == usuario_id
    ).order_by(models.SolicitudUpgrade.fecha_solicitud.desc()).all()