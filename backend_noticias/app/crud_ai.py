from sqlalchemy.orm import Session
from typing import Optional, List
import logging
from app import models, schemas
from app.ai_analyzer import ai_analyzer  # Nueva importación

logger = logging.getLogger(__name__)

class CRUDAnalisisIA:
    def obtener_analisis_por_noticia_id(self, db: Session, noticia_id: int) -> Optional[models.AnalisisIA]:
        """Obtiene el análisis IA de una noticia por su ID"""
        return db.query(models.AnalisisIA).filter(
            models.AnalisisIA.noticia_id == noticia_id
        ).first()
    
    def crear_analisis(self, db: Session, noticia_id: int) -> Optional[models.AnalisisIA]:
        """Crea un nuevo análisis IA para una noticia"""
        try:
            # Obtener la noticia
            noticia = db.query(models.Noticia).filter(models.Noticia.id == noticia_id).first()
            if not noticia:
                logger.error(f"Noticia no encontrada: {noticia_id}")
                return None
            
            # Verificar si ya existe análisis
            analisis_existente = self.obtener_analisis_por_noticia_id(db, noticia_id)
            if analisis_existente:
                logger.info(f"Análisis IA ya existe para noticia {noticia_id}")
                return analisis_existente
            
            # Realizar análisis inteligente
            logger.info(f"Iniciando análisis para noticia {noticia_id}: {noticia.titulo[:50]}...")
            analisis_data = ai_analyzer.analizar_noticia(noticia.titulo, noticia.contenido or "")
            
            # Crear registro en base de datos
            db_analisis = models.AnalisisIA(
                noticia_id=noticia_id,
                resumen=analisis_data.get('resumen', 'Resumen no disponible'),
                categoria=analisis_data.get('categoria', 'General'),
                sentimiento=analisis_data.get('sentimiento', 'neutral'),
                temas_principales=analisis_data.get('temas_principales', []),
                puntuacion_importancia=analisis_data.get('puntuacion_importancia', 5),
                palabras_clave=analisis_data.get('palabras_clave', [])
            )
            
            db.add(db_analisis)
            db.commit()
            db.refresh(db_analisis)
            
            logger.info(f"✅ Análisis creado exitosamente para noticia {noticia_id}")
            return db_analisis
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Error creando análisis para noticia {noticia_id}: {e}")
            return None

# Instancia global
crud_analisis_ia = CRUDAnalisisIA()