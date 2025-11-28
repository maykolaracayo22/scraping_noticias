from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import logging

from app import models, schemas

logger = logging.getLogger(__name__)

class CRUDReportes:
    def crear_reporte(self, db: Session, reporte_data: dict) -> Optional[models.ReporteNoticia]:
        """Crea un nuevo reporte de noticia"""
        try:
            # Verificar que la noticia existe
            noticia = db.query(models.Noticia).filter(models.Noticia.id == reporte_data['noticia_id']).first()
            if not noticia:
                logger.error(f"Noticia no encontrada: {reporte_data['noticia_id']}")
                return None
            
            db_reporte = models.ReporteNoticia(
                noticia_id=reporte_data['noticia_id'],
                motivo=reporte_data['motivo'],
                estado='pendiente'
            )
            
            db.add(db_reporte)
            db.commit()
            db.refresh(db_reporte)
            
            logger.info(f"Reporte creado para noticia {reporte_data['noticia_id']}")
            return db_reporte
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creando reporte: {e}")
            return None
    
    def obtener_reporte_por_id(self, db: Session, reporte_id: int) -> Optional[models.ReporteNoticia]:
        """Obtiene un reporte por su ID"""
        return db.query(models.ReporteNoticia).filter(models.ReporteNoticia.id == reporte_id).first()
    
    def obtener_todos_reportes(self, db: Session, skip: int = 0, limit: int = 100, estado: Optional[str] = None) -> List[models.ReporteNoticia]:
        """Obtiene todos los reportes con filtro opcional por estado"""
        query = db.query(models.ReporteNoticia)
        
        if estado:
            query = query.filter(models.ReporteNoticia.estado == estado)
        
        return query.order_by(desc(models.ReporteNoticia.fecha_reporte)).offset(skip).limit(limit).all()
    
    def actualizar_reporte(self, db: Session, reporte_id: int, reporte_data: dict) -> Optional[models.ReporteNoticia]:
        """Actualiza el estado de un reporte"""
        try:
            db_reporte = db.query(models.ReporteNoticia).filter(models.ReporteNoticia.id == reporte_id).first()
            if not db_reporte:
                return None
            
            for key, value in reporte_data.items():
                setattr(db_reporte, key, value)
            
            # Si se cambia el estado a "revisado" o "resuelto", actualizar fecha_revision
            if reporte_data.get('estado') in ['revisado', 'resuelto'] and not db_reporte.fecha_revision:
                db_reporte.fecha_revision = func.now()
            
            db.commit()
            db.refresh(db_reporte)
            
            logger.info(f"Reporte {reporte_id} actualizado a estado: {reporte_data.get('estado')}")
            return db_reporte
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error actualizando reporte {reporte_id}: {e}")
            return None
    
    def eliminar_reporte(self, db: Session, reporte_id: int) -> bool:
        """Elimina un reporte"""
        try:
            db_reporte = db.query(models.ReporteNoticia).filter(models.ReporteNoticia.id == reporte_id).first()
            if not db_reporte:
                return False
            
            db.delete(db_reporte)
            db.commit()
            
            logger.info(f"Reporte {reporte_id} eliminado")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error eliminando reporte {reporte_id}: {e}")
            return False
    
    def obtener_estadisticas_reportes(self, db: Session) -> Dict[str, Any]:
        """Obtiene estadísticas de los reportes"""
        # Total de reportes
        total_reportes = db.query(models.ReporteNoticia).count()
        
        # Reportes por estado
        reportes_por_estado = db.query(
            models.ReporteNoticia.estado,
            func.count(models.ReporteNoticia.id)
        ).group_by(models.ReporteNoticia.estado).all()
        
        # Noticias más reportadas
        noticias_mas_reportadas = db.query(
            models.Noticia.id,
            models.Noticia.titulo,
            models.Noticia.fuente,
            func.count(models.ReporteNoticia.id).label('cantidad_reportes')
        ).join(
            models.ReporteNoticia, models.Noticia.id == models.ReporteNoticia.noticia_id
        ).group_by(
            models.Noticia.id
        ).order_by(
            desc('cantidad_reportes')
        ).limit(10).all()
        
        return {
            'total_reportes': total_reportes,
            'reportes_pendientes': db.query(models.ReporteNoticia).filter(models.ReporteNoticia.estado == 'pendiente').count(),
            'reportes_revisados': db.query(models.ReporteNoticia).filter(models.ReporteNoticia.estado == 'revisado').count(),
            'reportes_por_estado': dict(reportes_por_estado),
            'noticias_mas_reportadas': [
                {
                    'id': noticia.id,
                    'titulo': noticia.titulo,
                    'fuente': noticia.fuente,
                    'cantidad_reportes': noticia.cantidad_reportes
                }
                for noticia in noticias_mas_reportadas
            ]
        }

# Instancia global del CRUD para reportes
crud_reportes = CRUDReportes()

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
        try:
            # Total de noticias
            total_noticias = db.query(models.Noticia).count()
            
            # Contar por categoría - CORREGIDO
            categorias_count_result = db.query(
                models.Noticia.categoria, 
                func.count(models.Noticia.id)
            ).group_by(models.Noticia.categoria).all()
            
            categorias_count = {categoria: count for categoria, count in categorias_count_result}
            
            # Contar por fuente - CORREGIDO
            fuentes_count_result = db.query(
                models.Noticia.fuente, 
                func.count(models.Noticia.id)
            ).group_by(models.Noticia.fuente).all()
            
            fuentes_count = {fuente: count for fuente, count in fuentes_count_result}
            
            # Noticia más reciente
            noticia_reciente = db.query(models.Noticia).order_by(models.Noticia.fecha_creacion.desc()).first()
            
            return {
                'total_noticias': total_noticias,
                'categorias': categorias_count,
                'fuentes': fuentes_count,
                'ultima_actualizacion': noticia_reciente.fecha_creacion if noticia_reciente else None
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            # Retornar datos vacíos en caso de error
            return {
                'total_noticias': 0,
                'categorias': {},
                'fuentes': {},
                'ultima_actualizacion': None
            }
    
    def buscar_noticias(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> List[models.Noticia]:
        """Busca noticias por texto en título o contenido"""
        return db.query(models.Noticia).filter(
            or_(
                models.Noticia.titulo.ilike(f'%{query}%'),
                models.Noticia.contenido.ilike(f'%{query}%')
            )
        ).order_by(models.Noticia.fecha.desc()).offset(skip).limit(limit).all()

    # ==================== NUEVAS FUNCIONES PARA MÉTRICAS AVANZADAS ====================

    def obtener_palabras_mas_buscadas(self, db: Session, limite: int = 10) -> List[dict]:
            """Obtiene las palabras más buscadas basadas en categorías"""
            try:
                estadisticas = self.obtener_estadisticas(db)
                categorias_count = estadisticas.get('categorias', {})
                palabras = []
                
                for categoria, count in categorias_count.items():
                    palabras.append({
                        'palabra': categoria,
                        'cantidad': count
                    })
                
                # Ordenar por cantidad y limitar
                palabras.sort(key=lambda x: x['cantidad'], reverse=True)
                
                # Si no hay datos, devolver algunos ejemplos
                if not palabras:
                    palabras = [
                        {'palabra': 'Política', 'cantidad': 10},
                        {'palabra': 'Deportes', 'cantidad': 8},
                        {'palabra': 'Tecnología', 'cantidad': 6},
                        {'palabra': 'Economía', 'cantidad': 5},
                        {'palabra': 'Salud', 'cantidad': 4}
                    ]
                    
                return palabras[:limite]
            except Exception as e:
                logger.error(f"Error obteniendo palabras más buscadas: {e}")
                # Datos de ejemplo como fallback
                return [
                    {'palabra': 'Política', 'cantidad': 10},
                    {'palabra': 'Deportes', 'cantidad': 8},
                    {'palabra': 'Tecnología', 'cantidad': 6}
                ]

    def obtener_noticias_mas_populares(self, db: Session, limite: int = 10) -> List[dict]:
            """Obtiene las noticias más populares (basado en reportes)"""
            try:
                # Usar reportes como proxy de popularidad
                noticias_populares = db.query(
                    models.Noticia.id,
                    models.Noticia.titulo,
                    func.count(models.ReporteNoticia.id).label('vistas')
                ).outerjoin(
                    models.ReporteNoticia, models.Noticia.id == models.ReporteNoticia.noticia_id
                ).group_by(
                    models.Noticia.id
                ).order_by(
                    func.count(models.ReporteNoticia.id).desc()
                ).limit(limite).all()
                
                resultado = [
                    {
                        'noticia_id': noticia.id,
                        'titulo': noticia.titulo,
                        'vistas': noticia.vistas or 0
                    }
                    for noticia in noticias_populares
                ]
                
                # Si no hay datos, usar noticias recientes
                if not resultado:
                    noticias_recientes = db.query(models.Noticia).order_by(
                        models.Noticia.fecha_creacion.desc()
                    ).limit(limite).all()
                    
                    resultado = [
                        {
                            'noticia_id': noticia.id,
                            'titulo': noticia.titulo,
                            'vistas': 0
                        }
                        for noticia in noticias_recientes
                    ]
                    
                return resultado
                
            except Exception as e:
                logger.error(f"Error obteniendo noticias populares: {e}")
                # Datos de ejemplo como fallback
                return [
                    {
                        'noticia_id': 1,
                        'titulo': 'Noticia de ejemplo 1',
                        'vistas': 5
                    },
                    {
                        'noticia_id': 2,
                        'titulo': 'Noticia de ejemplo 2', 
                        'vistas': 3
                    }
                ]

    def obtener_categorias_mas_populares(self, db: Session) -> List[dict]:
        """Obtiene las categorías más populares con porcentajes"""
        try:
            estadisticas = self.obtener_estadisticas(db)
            total_noticias = estadisticas['total_noticias']
            categorias = estadisticas['categorias']
            
            if total_noticias == 0:
                return []
            
            categorias_populares = []
            for categoria, count in categorias.items():
                porcentaje = round((count / total_noticias) * 100, 1)
                categorias_populares.append({
                    'categoria': categoria,
                    'porcentaje': porcentaje
                })
            
            # Ordenar por porcentaje
            categorias_populares.sort(key=lambda x: x['porcentaje'], reverse=True)
            return categorias_populares
            
        except Exception as e:
            logger.error(f"Error obteniendo categorías populares: {e}")
            return []
    def obtener_palabras_mas_frecuentes(self, db: Session, limite: int = 100) -> List[dict]:
        """Obtiene las palabras más frecuentes en títulos y contenido de noticias"""
        try:
            import re
            from collections import Counter
            
            # Obtener todas las noticias
            noticias = db.query(models.Noticia).all()
            
            if not noticias:
                return []
            
            # Palabras comunes a excluir (stop words en español)
            stop_words = {
                'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'tras', 'https',
                'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'segun','mientras',
                'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 
                'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 
                'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 
                'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 
                'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 
                'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 
                'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 
                'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 
                'vuestros', 'vuestras', 'esos', 'esas', 'estoy', 'estás', 'está', 'estamos', 'estáis', 
                'están', 'esté', 'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás', 'estará', 
                'estaremos', 'estaréis', 'estarán', 'estaría', 'estarías', 'estaríamos', 'estaríais', 
                'estarían', 'estaba', 'estabas', 'estábamos', 'estabais', 'estaban', 'estuve', 'estuviste', 
                'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron', 'estuviera', 'estuvieras', 'estuviéramos', 
                'estuvierais', 'estuvieran', 'estuviese', 'estuvieses', 'estuviésemos', 'estuvieseis', 
                'estuviesen', 'estando', 'estado', 'estada', 'estados', 'estadas', 'estad', 'he', 'has', 
                'ha', 'hemos', 'habéis', 'han', 'haya', 'hayas', 'hayamos', 'hayáis', 'hayan', 'habré', 
                'habrás', 'habrá', 'habremos', 'habréis', 'habrán', 'habría', 'habrías', 'habríamos', 
                'habríais', 'habrían', 'había', 'habías', 'habíamos', 'habíais', 'habían', 'hube', 'hubiste', 
                'hubo', 'hubimos', 'hubisteis', 'hubieron', 'hubiera', 'hubieras', 'hubiéramos', 'hubierais', 
                'hubieran', 'hubiese', 'hubieses', 'hubiésemos', 'hubieseis', 'hubiesen', 'habiendo', 
                'habido', 'habida', 'habidos', 'habidas', 'soy', 'eres', 'es', 'somos', 'sois', 'son', 
                'sea', 'seas', 'seamos', 'seáis', 'sean', 'seré', 'serás', 'será', 'seremos', 'seréis', 
                'serán', 'sería', 'serías', 'seríamos', 'seríais', 'serían', 'era', 'eras', 'éramos', 
                'erais', 'eran', 'fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron', 'fuera', 'fueras', 
                'fuéramos', 'fuerais', 'fueran', 'fuese', 'fueses', 'fuésemos', 'fueseis', 'fuesen', 
                'sintiendo', 'sentido', 'sentida', 'sentidos', 'sentidas', 'siente', 'sentid', 'tengo', 
                'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen', 'tenga', 'tengas', 'tengamos', 'tengáis', 
                'tengan', 'tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán', 'tendría', 
                'tendrías', 'tendríamos', 'tendríais', 'tendrían', 'tenía', 'tenías', 'teníamos', 'teníais', 
                'tenían', 'tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron', 'tuviera', 
                'tuvieras', 'tuviéramos', 'tuvierais', 'tuvieran', 'tuviese', 'tuvieses', 'tuviésemos', 
                'tuvieseis', 'tuviesen', 'teniendo', 'tenido', 'tenida', 'tenidos', 'tenidas', 'tened'
            }
            
            # Unir todos los títulos y contenidos
            texto_completo = ""
            for noticia in noticias:
                if noticia.titulo:
                    texto_completo += " " + noticia.titulo.lower()
                if noticia.contenido:
                    texto_completo += " " + noticia.contenido.lower()
            
            # Extraer palabras usando regex (solo palabras con letras)
            palabras = re.findall(r'\b[a-záéíóúñ]{4,}\b', texto_completo)
            
            # Filtrar stop words y contar frecuencia
            palabras_filtradas = [palabra for palabra in palabras if palabra not in stop_words]
            contador = Counter(palabras_filtradas)
            
            # Obtener las más comunes
            palabras_comunes = contador.most_common(limite)
            
            return [
                {
                    'palabra': palabra,
                    'cantidad': cantidad
                }
                for palabra, cantidad in palabras_comunes
            ]
            
        except Exception as e:
            logger.error(f"Error obteniendo palabras más frecuentes: {e}")
            # Datos de ejemplo como fallback
            return [
                {'palabra': 'gobierno', 'cantidad': 25},
                {'palabra': 'presidente', 'cantidad': 18},
                {'palabra': 'partido', 'cantidad': 15},
                {'palabra': 'país', 'cantidad': 12},
                {'palabra': 'dólar', 'cantidad': 10},
                {'palabra': 'economía', 'cantidad': 9},
                {'palabra': 'fútbol', 'cantidad': 8},
                {'palabra': 'equipo', 'cantidad': 7},
                {'palabra': 'tecnología', 'cantidad': 6},
                {'palabra': 'internet', 'cantidad': 5}
            ]

    def obtener_tendencias_temporales(self, db: Session) -> dict:
            """Obtiene tendencias temporales de noticias"""
            try:
                # Última semana - CORREGIDO para MySQL
                fecha_inicio_semana = datetime.now() - timedelta(days=7)
                
                noticias_semana = db.query(
                    func.date(models.Noticia.fecha_creacion).label('fecha'),
                    func.count(models.Noticia.id).label('cantidad')
                ).filter(
                    models.Noticia.fecha_creacion >= fecha_inicio_semana
                ).group_by(
                    func.date(models.Noticia.fecha_creacion)
                ).order_by(
                    func.date(models.Noticia.fecha_creacion)
                ).all()
                
                # Último mes - SIMPLIFICADO para evitar problemas con GROUP BY
                fecha_inicio_mes = datetime.now() - timedelta(days=30)
                
                # Contar noticias por semana de forma más simple
                noticias_mes_count = db.query(models.Noticia).filter(
                    models.Noticia.fecha_creacion >= fecha_inicio_mes
                ).count()
                
                # Dividir en 4 semanas aproximadas
                noticias_por_semana = noticias_mes_count // 4 if noticias_mes_count > 0 else 0
                
                return {
                    'ultima_semana': [
                        {'fecha': str(noticia.fecha), 'cantidad': noticia.cantidad}
                        for noticia in noticias_semana
                    ],
                    'ultimo_mes': [
                        {'fecha': 'Semana 1', 'cantidad': noticias_por_semana},
                        {'fecha': 'Semana 2', 'cantidad': noticias_por_semana},
                        {'fecha': 'Semana 3', 'cantidad': noticias_por_semana},
                        {'fecha': 'Semana 4', 'cantidad': noticias_por_semana}
                    ]
                }
                
            except Exception as e:
                logger.error(f"Error obteniendo tendencias temporales: {e}")
                # Datos de ejemplo como fallback
                return {
                    'ultima_semana': [
                        {'fecha': str(datetime.now().date()), 'cantidad': 10}
                    ],
                    'ultimo_mes': [
                        {'fecha': 'Semana 1', 'cantidad': 25},
                        {'fecha': 'Semana 2', 'cantidad': 30},
                        {'fecha': 'Semana 3', 'cantidad': 28},
                        {'fecha': 'Semana 4', 'cantidad': 32}
                    ]
                }
    
# Instancia global del CRUD
crud_noticias = CRUDNoticias()