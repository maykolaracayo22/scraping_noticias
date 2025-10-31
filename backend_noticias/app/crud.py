from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import date, datetime
import logging

from . import models, schemas

logger = logging.getLogger(__name__)

class CRUDNoticias:
    def crear_noticia(self, db: Session, noticia_data: dict) -> Optional[models.Noticia]:
        """Crea una nueva noticia en la base de datos"""
        try:
            # Verificar si ya existe una noticia con el mismo enlace
            noticia_existente = db.query(models.Noticia).filter(
                models.Noticia.enlace == noticia_data['enlace']
            ).first()
            
            if noticia_existente:
                logger.info(f"Noticia duplicada omitida: {noticia_data['enlace']}")
                return None
            
            # Crear nueva noticia
            db_noticia = models.Noticia(
                titulo=noticia_data['titulo'],
                enlace=noticia_data['enlace'],
                fecha=noticia_data['fecha'],
                categoria=noticia_data['categoria'],
                contenido=noticia_data.get('contenido', ''),
                imagen_url=noticia_data.get('imagen_url', ''),
                fuente=noticia_data['fuente']
            )
            
            db.add(db_noticia)
            db.commit()
            db.refresh(db_noticia)
            
            logger.info(f"Noticia guardada: {db_noticia.titulo[:50]}...")
            return db_noticia
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creando noticia: {e}")
            return None
    
    def obtener_noticia_por_id(self, db: Session, noticia_id: int) -> Optional[models.Noticia]:
        """Obtiene una noticia por su ID"""
        return db.query(models.Noticia).filter(models.Noticia.id == noticia_id).first()
    
    def obtener_todas_noticias(self, db: Session, skip: int = 0, limit: int = 100) -> List[models.Noticia]:
        """Obtiene todas las noticias con paginación"""
        return db.query(models.Noticia).order_by(models.Noticia.fecha.desc()).offset(skip).limit(limit).all()
    
    def obtener_noticias_por_categoria(self, db: Session, categoria: str, skip: int = 0, limit: int = 100) -> List[models.Noticia]:
        """Obtiene noticias filtradas por categoría"""
        return db.query(models.Noticia).filter(
            models.Noticia.categoria == categoria
        ).order_by(models.Noticia.fecha.desc()).offset(skip).limit(limit).all()
    
    def obtener_noticias_por_fuente(self, db: Session, fuente: str, skip: int = 0, limit: int = 100) -> List[models.Noticia]:
        """Obtiene noticias filtradas por fuente"""
        return db.query(models.Noticia).filter(
            models.Noticia.fuente == fuente
        ).order_by(models.Noticia.fecha.desc()).offset(skip).limit(limit).all()
    
    def obtener_estadisticas(self, db: Session) -> dict:
        """Obtiene estadísticas de las noticias en la base de datos"""
        total_noticias = db.query(models.Noticia).count()
        
        # Contar por categoría
        categorias_count = db.query(
            models.Noticia.categoria, 
            db.func.count(models.Noticia.id)
        ).group_by(models.Noticia.categoria).all()
        
        # Contar por fuente
        fuentes_count = db.query(
            models.Noticia.fuente, 
            db.func.count(models.Noticia.id)
        ).group_by(models.Noticia.fuente).all()
        
        # Noticia más reciente
        noticia_reciente = db.query(models.Noticia).order_by(models.Noticia.fecha.desc()).first()
        
        return {
            'total_noticias': total_noticias,
            'categorias': dict(categorias_count),
            'fuentes': dict(fuentes_count),
            'ultima_actualizacion': noticia_reciente.fecha_creacion if noticia_reciente else None
        }
    
    def buscar_noticias(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> List[models.Noticia]:
        """Busca noticias por texto en título o contenido"""
        return db.query(models.Noticia).filter(
            or_(
                models.Noticia.titulo.ilike(f'%{query}%'),
                models.Noticia.contenido.ilike(f'%{query}%')
            )
        ).order_by(models.Noticia.fecha.desc()).offset(skip).limit(limit).all()

# Instancia global del CRUD
crud_noticias = CRUDNoticias()