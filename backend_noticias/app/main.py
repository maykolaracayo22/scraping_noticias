import sys
import os
from pathlib import Path

# Agregar el directorio padre al path para imports
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from app.schemas_reporte import Reporte, ReporteCreate, ReporteUpdate, ReporteConNoticia, EstadisticasReportes
from app.schemas_auth import UsuarioCreate, UsuarioLogin, UsuarioResponse, Token, PlanInfo
from app.schemas_upgrade import (
    SolicitudUpgradeCreate, SolicitudUpgradeResponse, SolicitudUpgradeUpdate
)
from app.crud import crud_reportes
from app.crud_auth import crear_usuario_admin_inicial, autenticar_usuario, crear_usuario
from app.crud_upgrade import (
    crear_solicitud_upgrade, obtener_solicitudes_upgrade, 
    actualizar_solicitud_upgrade, obtener_solicitudes_por_usuario
)
from app.auth import crear_access_token, obtener_usuario_actual, verificar_rol_admin, verificar_plan_plus

from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import asyncio
from datetime import timedelta
# En la sección de importaciones, agrega:
from app.crud_auth import obtener_estadisticas_usuarios
# Importaciones locales
from app import models, schemas, crud, scraper, database
from app.database import get_db, create_tables
from app.crud_ai import crud_analisis_ia
from app.schemas import AnalisisIARequest, AnalisisIAResponse
# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="News Aggregator API",
    description="API para scraping y gestión de noticias peruanas",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Especifica tus origenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evento de inicio: crear tablas y admin inicial
@app.on_event("startup")
def startup_event():
    create_tables()
    # Crear usuario admin por defecto
    db = next(get_db())
    try:
        crear_usuario_admin_inicial(db)
        logger.info("✅ Usuario admin creado/verificado: admin@newsperu.com / 123456")
    except Exception as e:
        logger.error(f"Error creando usuario admin: {e}")
    finally:
        db.close()
    logger.info("Tablas de la base de datos verificadas/creadas")

# Endpoints principales
@app.get("/")
def read_root():
    return {
        "mensaje": "Bienvenido al News Aggregator API",
        "endpoints": {
            "noticias": "/noticias",
            "noticia_por_id": "/noticias/{id}",
            "noticias_por_categoria": "/noticias/categoria/{categoria}",
            "estadisticas": "/estadisticas",
            "scraping": "/scrape (POST)"
        }
    }

@app.get("/noticias", response_model=List[schemas.Noticia])
def listar_noticias(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    fuente: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las noticias con paginación.
    Opcionalmente filtra por fuente.
    """
    if fuente:
        noticias = crud.crud_noticias.obtener_noticias_por_fuente(db, fuente=fuente, skip=skip, limit=limit)
    else:
        noticias = crud.crud_noticias.obtener_todas_noticias(db, skip=skip, limit=limit)
    
    return noticias

@app.get("/noticias/{noticia_id}", response_model=schemas.Noticia)
def obtener_noticia(noticia_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una noticia específica por su ID.
    """
    noticia = crud.crud_noticias.obtener_noticia_por_id(db, noticia_id=noticia_id)
    if noticia is None:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    return noticia

@app.get("/noticias/categoria/{categoria}", response_model=List[schemas.Noticia])
def listar_noticias_por_categoria(
    categoria: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Obtiene noticias filtradas por categoría.
    """
    noticias = crud.crud_noticias.obtener_noticias_por_categoria(db, categoria=categoria, skip=skip, limit=limit)
    return noticias

@app.get("/buscar", response_model=List[schemas.Noticia])
def buscar_noticias(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Busca noticias por texto en título o contenido.
    """
    noticias = crud.crud_noticias.buscar_noticias(db, query=q, skip=skip, limit=limit)
    return noticias

@app.get("/estadisticas", response_model=schemas.EstadisticasResponse)
def obtener_estadisticas(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas de las noticias en la base de datos.
    """
    return crud.crud_noticias.obtener_estadisticas(db)

@app.post("/scrape", response_model=schemas.ScrapingResponse)
def ejecutar_scraping(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Ejecuta el scraping de todas las fuentes de noticias y guarda los resultados.
    """
    def _procesar_scraping():
        try:
            # Ejecutar scraping
            noticias_obtenidas = scraper.scraper.ejecutar_scraping_completo()
            
            # Guardar en base de datos
            noticias_guardadas = 0
            duplicados = 0
            errores = 0
            
            for noticia_data in noticias_obtenidas:
                resultado = crud.crud_noticias.crear_noticia(db, noticia_data)
                if resultado:
                    noticias_guardadas += 1
                else:
                    if db.query(models.Noticia).filter(models.Noticia.enlace == noticia_data['enlace']).first():
                        duplicados += 1
                    else:
                        errores += 1
            
            logger.info(f"Scraping completado: {noticias_guardadas} nuevas, {duplicados} duplicados, {errores} errores")
            
        except Exception as e:
            logger.error(f"Error en proceso de scraping: {e}")
    
    # Ejecutar en segundo plano
    background_tasks.add_task(_procesar_scraping)
    
    return {
        "mensaje": "Scraping iniciado en segundo plano",
        "noticias_obtenidas": 0,  # Se actualizará cuando termine
        "noticias_guardadas": 0,
        "duplicados": 0,
        "errores": 0
    }

@app.get("/fuentes")
def listar_fuentes():
    """
    Lista todas las fuentes de noticias disponibles.
    """
    return {
        "fuentes": list(scraper.settings.NEWS_SOURCES.keys()),
        "urls": scraper.settings.NEWS_SOURCES
    }

@app.get("/categorias")
def listar_categorias():
    """
    Lista todas las categorías disponibles.
    """
    categorias = list(scraper.clasificador.palabras_clave.keys())
    categorias.append("General")
    return {"categorias": categorias}

# ==================== ENDPOINTS DE REPORTES ====================

@app.post("/reportes", response_model=Reporte)
def crear_reporte(reporte: ReporteCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo reporte para una noticia
    """
    try:
        reporte_data = {
            'noticia_id': reporte.noticia_id,
            'motivo': reporte.motivo
        }
        
        db_reporte = crud_reportes.crear_reporte(db, reporte_data)
        if not db_reporte:
            raise HTTPException(status_code=404, detail="Noticia no encontrada")
        
        return db_reporte
        
    except Exception as e:
        logger.error(f"Error creando reporte: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/reportes", response_model=List[ReporteConNoticia])
def listar_reportes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    estado: Optional[str] = Query(None, regex="^(pendiente|revisado|resuelto|descartado)$"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los reportes con información de la noticia
    """
    try:
        reportes = crud_reportes.obtener_todos_reportes(db, skip=skip, limit=limit, estado=estado)
        
        # Enriquecer con información de la noticia
        reportes_con_noticia = []
        for reporte in reportes:
            reporte_dict = {**reporte.__dict__}
            reporte_dict['titulo_noticia'] = reporte.noticia.titulo
            reporte_dict['fuente_noticia'] = reporte.noticia.fuente
            reporte_dict['enlace_noticia'] = reporte.noticia.enlace
            reportes_con_noticia.append(reporte_dict)
        
        return reportes_con_noticia
        
    except Exception as e:
        logger.error(f"Error obteniendo reportes: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/reportes/{reporte_id}", response_model=ReporteConNoticia)
def obtener_reporte(reporte_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un reporte específico por ID
    """
    reporte = crud_reportes.obtener_reporte_por_id(db, reporte_id)
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    # Enriquecer con información de la noticia
    reporte_dict = {**reporte.__dict__}
    reporte_dict['titulo_noticia'] = reporte.noticia.titulo
    reporte_dict['fuente_noticia'] = reporte.noticia.fuente
    reporte_dict['enlace_noticia'] = reporte.noticia.enlace
    
    return reporte_dict

@app.put("/reportes/{reporte_id}", response_model=Reporte)
def actualizar_reporte(reporte_id: int, reporte_update: ReporteUpdate, db: Session = Depends(get_db)):
    """
    Actualiza el estado de un reporte (para administradores)
    """
    try:
        reporte_data = {
            'estado': reporte_update.estado,
            'notas_admin': reporte_update.notas_admin
        }
        
        db_reporte = crud_reportes.actualizar_reporte(db, reporte_id, reporte_data)
        if not db_reporte:
            raise HTTPException(status_code=404, detail="Reporte no encontrado")
        
        return db_reporte
        
    except Exception as e:
        logger.error(f"Error actualizando reporte: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.delete("/reportes/{reporte_id}")
def eliminar_reporte(reporte_id: int, db: Session = Depends(get_db)):
    """
    Elimina un reporte (para administradores)
    """
    success = crud_reportes.eliminar_reporte(db, reporte_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    return {"mensaje": "Reporte eliminado correctamente"}

@app.get("/reportes/estadisticas", response_model=EstadisticasReportes)
def obtener_estadisticas_reportes(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas de los reportes
    """
    try:
        estadisticas = crud_reportes.obtener_estadisticas_reportes(db)
        return estadisticas
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de reportes: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    
# ==================== ENDPOINTS DE ANÁLISIS IA ====================

@app.post("/analizar-noticia-ia", response_model=AnalisisIAResponse)
def analizar_noticia_ia(
    request: AnalisisIARequest,
    db: Session = Depends(get_db),
    usuario_actual: UsuarioResponse = Depends(verificar_plan_plus)
):
    """
    Analiza una noticia con IA (solo para usuarios PLUS)
    """
    try:
        # Verificar que la noticia existe
        noticia = crud.crud_noticias.obtener_noticia_por_id(db, request.noticia_id)
        if not noticia:
            raise HTTPException(status_code=404, detail="Noticia no encontrada")
        
        # Crear o obtener análisis existente
        analisis = crud_analisis_ia.crear_analisis(db, request.noticia_id)
        if not analisis:
            raise HTTPException(status_code=500, detail="Error al analizar la noticia")
        
        return {
            "analisis": analisis,
            "noticia": noticia
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en análisis IA: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/noticias/{noticia_id}/analisis-ia", response_model=AnalisisIAResponse)
def obtener_analisis_ia_noticia(
    noticia_id: int,
    db: Session = Depends(get_db),
    usuario_actual: UsuarioResponse = Depends(verificar_plan_plus)
):
    """
    Obtiene el análisis IA de una noticia (solo para usuarios PLUS)
    """
    try:
        # Verificar que la noticia existe
        noticia = crud.crud_noticias.obtener_noticia_por_id(db, noticia_id)
        if not noticia:
            raise HTTPException(status_code=404, detail="Noticia no encontrada")
        
        # Obtener análisis existente
        analisis = crud_analisis_ia.obtener_analisis_por_noticia_id(db, noticia_id)
        if not analisis:
            raise HTTPException(status_code=404, detail="Análisis no encontrado para esta noticia")
        
        return {
            "analisis": analisis,
            "noticia": noticia
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo análisis IA: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== ENDPOINTS DE AUTENTICACIÓN ====================

@app.post("/registro", response_model=UsuarioResponse)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registrar nuevo usuario (siempre como 'user' con plan 'free')
    """
    try:
        db_usuario = crear_usuario(db, usuario)
        return db_usuario
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login", response_model=Token)
def login_usuario(usuario: UsuarioLogin, db: Session = Depends(get_db)):
    """
    Iniciar sesión y obtener token JWT
    """
    db_usuario = autenticar_usuario(db, usuario.email, usuario.password)
    if not db_usuario:
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = crear_access_token(
        data={"sub": db_usuario.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": db_usuario
    }

@app.get("/usuario/actual", response_model=UsuarioResponse)
def obtener_usuario_actual_endpoint(usuario: UsuarioResponse = Depends(obtener_usuario_actual)):
    """
    Obtener información del usuario actual
    """
    return usuario

@app.get("/usuario/plan-info", response_model=PlanInfo)
def obtener_info_plan(usuario: UsuarioResponse = Depends(obtener_usuario_actual)):
    """
    Obtener información del plan actual y permisos
    """
    return {
        "plan_actual": usuario.plan,
        "puede_exportar": usuario.plan == "plus" or usuario.rol == "admin",
        "puede_scraping_avanzado": usuario.plan == "plus" or usuario.rol == "admin"
    }

# ==================== ENDPOINTS PROTEGIDOS POR PLAN ====================

@app.post("/scrape-avanzado", response_model=schemas.ScrapingResponse)
def ejecutar_scraping_avanzado(
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db),
    usuario: UsuarioResponse = Depends(verificar_plan_plus)
):
    """
    Ejecutar scraping avanzado (solo para plan Plus)
    """
    # Tu código de scraping avanzado aquí
    return {
        "mensaje": "Scraping avanzado iniciado (solo Plus)",
        "noticias_obtenidas": 0,
        "noticias_guardadas": 0,
        "duplicados": 0,
        "errores": 0
    }

# ==================== ENDPOINTS DE ADMINISTRADOR ====================

@app.get("/admin/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    admin: UsuarioResponse = Depends(verificar_rol_admin)
):
    """
    Listar todos los usuarios (solo administradores)
    """
    return db.query(models.Usuario).all()

# ==================== ENDPOINTS DE MÉTRICAS AVANZADAS ====================

@app.get("/admin/metricas-avanzadas")
def obtener_metricas_avanzadas(
    db: Session = Depends(get_db),
    admin: UsuarioResponse = Depends(verificar_rol_admin)
):
    """
    Obtiene métricas avanzadas del sistema (solo administradores)
    """
    try:
        # Obtener todas las métricas con manejo individual de errores
        metricas = {}
        
        try:
            palabras_buscadas = crud.crud_noticias.obtener_palabras_mas_buscadas(db)
            metricas["palabras_mas_buscadas"] = palabras_buscadas
            logger.info(f"Palabras más buscadas obtenidas: {len(palabras_buscadas)}")
        except Exception as e:
            logger.error(f"Error obteniendo palabras más buscadas: {e}")
            metricas["palabras_mas_buscadas"] = []
        
        try:
            palabras_frecuentes = crud.crud_noticias.obtener_palabras_mas_frecuentes(db)
            metricas["palabras_mas_frecuentes"] = palabras_frecuentes
            logger.info(f"Palabras más frecuentes obtenidas: {len(palabras_frecuentes)}")
        except Exception as e:
            logger.error(f"Error obteniendo palabras más frecuentes: {e}")
            metricas["palabras_mas_frecuentes"] = []
        
        try:
            noticias = crud.crud_noticias.obtener_noticias_mas_populares(db)
            metricas["noticias_mas_vistas"] = noticias
            logger.info(f"Noticias populares obtenidas: {len(noticias)}")
        except Exception as e:
            logger.error(f"Error obteniendo noticias populares: {e}")
            metricas["noticias_mas_vistas"] = []
        
        try:
            categorias = crud.crud_noticias.obtener_categorias_mas_populares(db)
            metricas["categorias_mas_populares"] = categorias
            logger.info(f"Categorías populares obtenidas: {len(categorias)}")
        except Exception as e:
            logger.error(f"Error obteniendo categorías populares: {e}")
            metricas["categorias_mas_populares"] = []
        
        try:
            tendencias = crud.crud_noticias.obtener_tendencias_temporales(db)
            metricas["tendencias_temporales"] = tendencias
            logger.info(f"Tendencias obtenidas: semana={len(tendencias.get('ultima_semana', []))}, mes={len(tendencias.get('ultimo_mes', []))}")
        except Exception as e:
            logger.error(f"Error obteniendo tendencias temporales: {e}")
            metricas["tendencias_temporales"] = {'ultima_semana': [], 'ultimo_mes': []}
        
        try:
            usuarios = obtener_estadisticas_usuarios(db)
            metricas["actividad_usuarios"] = usuarios
            logger.info(f"Estadísticas de usuarios: {usuarios}")
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas de usuarios: {e}")
            metricas["actividad_usuarios"] = {
                'total_usuarios': 0,
                'usuarios_activos': 0,
                'nuevos_usuarios': 0,
                'usuarios_plus': 0
            }

        logger.info(f"Métricas completas devueltas: {metricas}")
        return metricas
        
    except Exception as e:
        logger.error(f"Error general obteniendo métricas avanzadas: {e}")
        # Devolver estructura vacía pero válida
        return {
            "palabras_mas_buscadas": [],
            "palabras_mas_frecuentes": [],
            "noticias_mas_vistas": [],
            "categorias_mas_populares": [],
            "tendencias_temporales": {'ultima_semana': [], 'ultimo_mes': []},
            "actividad_usuarios": {
                'total_usuarios': 0,
                'usuarios_activos': 0,
                'nuevos_usuarios': 0,
                'usuarios_plus': 0
            }
        }
# ==================== ENDPOINTS DE UPGRADE ====================

@app.post("/solicitudes-upgrade", response_model=SolicitudUpgradeResponse)
def crear_solicitud_upgrade_endpoint(
    solicitud: SolicitudUpgradeCreate,
    db: Session = Depends(get_db),
    usuario_actual: UsuarioResponse  = Depends(obtener_usuario_actual)
):
    """
    Crear una nueva solicitud de upgrade de plan
    """
    try:
        # Solo permitir upgrade a 'plus' por ahora
        if solicitud.plan_solicitado != 'plus':
            raise HTTPException(status_code=400, detail="Solo se permite upgrade al plan Plus")
        
        # Validar código Yape (6 dígitos)
        if not solicitud.codigo_yape.isdigit() or len(solicitud.codigo_yape) != 6:
            raise HTTPException(status_code=400, detail="El código Yape debe tener 6 dígitos")
        
        solicitud_data = {
            'usuario_id': usuario_actual.id,
            'plan_solicitado': solicitud.plan_solicitado,
            'codigo_yape': solicitud.codigo_yape,
            'monto': 1990  # S/ 19.90 en centimos
        }
        
        db_solicitud = crear_solicitud_upgrade(db, solicitud_data)
        
        # Crear respuesta manualmente para asegurar la serialización
        response_data = {
            'id': db_solicitud.id,
            'usuario_id': db_solicitud.usuario_id,
            'plan_solicitado': db_solicitud.plan_solicitado,
            'codigo_yape': db_solicitud.codigo_yape,
            'monto': db_solicitud.monto,
            'estado': db_solicitud.estado,
            'fecha_solicitud': db_solicitud.fecha_solicitud,
            'fecha_revision': db_solicitud.fecha_revision,
            'notas_admin': db_solicitud.notas_admin,
            'usuario_nombre': usuario_actual.nombre,
            'usuario_email': usuario_actual.email
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando solicitud de upgrade: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/solicitudes-upgrade/mis-solicitudes", response_model=List[SolicitudUpgradeResponse])
def obtener_mis_solicitudes(
    db: Session = Depends(get_db),
    usuario_actual: UsuarioResponse  = Depends(obtener_usuario_actual)
):
    """
    Obtener las solicitudes de upgrade del usuario actual
    """
    try:
        solicitudes = obtener_solicitudes_por_usuario(db, usuario_actual.id)
        
        # Crear respuesta manualmente para cada solicitud
        solicitudes_enriquecidas = []
        for solicitud in solicitudes:
            solicitud_dict = {
                'id': solicitud.id,
                'usuario_id': solicitud.usuario_id,
                'plan_solicitado': solicitud.plan_solicitado,
                'codigo_yape': solicitud.codigo_yape,
                'monto': solicitud.monto,
                'estado': solicitud.estado,
                'fecha_solicitud': solicitud.fecha_solicitud,
                'fecha_revision': solicitud.fecha_revision,
                'notas_admin': solicitud.notas_admin,
                'usuario_nombre': usuario_actual.nombre,
                'usuario_email': usuario_actual.email
            }
            solicitudes_enriquecidas.append(solicitud_dict)
        
        return solicitudes_enriquecidas
        
    except Exception as e:
        logger.error(f"Error obteniendo solicitudes: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/admin/solicitudes-upgrade", response_model=List[SolicitudUpgradeResponse])
def listar_solicitudes_upgrade(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    estado: str = Query(None, regex="^(pendiente|aprobado|rechazado)$"),
    db: Session = Depends(get_db),
    admin: UsuarioResponse = Depends(verificar_rol_admin)
):
    """
    Listar todas las solicitudes de upgrade (solo administradores)
    """
    try:
        solicitudes = obtener_solicitudes_upgrade(db, skip=skip, limit=limit, estado=estado)
        
        # Crear respuesta manualmente para cada solicitud
        solicitudes_enriquecidas = []
        for solicitud in solicitudes:
            solicitud_dict = {
                'id': solicitud.id,
                'usuario_id': solicitud.usuario_id,
                'plan_solicitado': solicitud.plan_solicitado,
                'codigo_yape': solicitud.codigo_yape,
                'monto': solicitud.monto,
                'estado': solicitud.estado,
                'fecha_solicitud': solicitud.fecha_solicitud,
                'fecha_revision': solicitud.fecha_revision,
                'notas_admin': solicitud.notas_admin,
                'usuario_nombre': solicitud.usuario.nombre,
                'usuario_email': solicitud.usuario.email
            }
            solicitudes_enriquecidas.append(solicitud_dict)
        
        return solicitudes_enriquecidas
        
    except Exception as e:
        logger.error(f"Error obteniendo solicitudes de upgrade: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.put("/admin/solicitudes-upgrade/{solicitud_id}", response_model=SolicitudUpgradeResponse)
def actualizar_solicitud_upgrade_endpoint(
    solicitud_id: int,
    solicitud_update: SolicitudUpgradeUpdate,
    db: Session = Depends(get_db),
    admin: UsuarioResponse = Depends(verificar_rol_admin)
):
    """
    Aprobar o rechazar una solicitud de upgrade (solo administradores)
    """
    try:
        db_solicitud = actualizar_solicitud_upgrade(db, solicitud_id, solicitud_update.dict())
        if not db_solicitud:
            raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
        # Crear respuesta manualmente
        response_data = {
            'id': db_solicitud.id,
            'usuario_id': db_solicitud.usuario_id,
            'plan_solicitado': db_solicitud.plan_solicitado,
            'codigo_yape': db_solicitud.codigo_yape,
            'monto': db_solicitud.monto,
            'estado': db_solicitud.estado,
            'fecha_solicitud': db_solicitud.fecha_solicitud,
            'fecha_revision': db_solicitud.fecha_revision,
            'notas_admin': db_solicitud.notas_admin,
            'usuario_nombre': db_solicitud.usuario.nombre,
            'usuario_email': db_solicitud.usuario.email
        }
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error actualizando solicitud: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    
# ==================== ENDPOINTS DE ADMIN PARA UPGRADES ====================

@app.get("/admin/solicitudes-upgrade", response_model=List[SolicitudUpgradeResponse])
def listar_solicitudes_upgrade(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    estado: str = Query(None, regex="^(pendiente|aprobado|rechazado)$"),
    db: Session = Depends(get_db),
    admin: UsuarioResponse = Depends(verificar_rol_admin)
):
    """
    Listar todas las solicitudes de upgrade (solo administradores)
    """
    try:
        solicitudes = obtener_solicitudes_upgrade(db, skip=skip, limit=limit, estado=estado)
        
        # Enriquecer con datos de usuario
        solicitudes_enriquecidas = []
        for solicitud in solicitudes:
            solicitud_dict = {**solicitud.__dict__}
            solicitud_dict['usuario_nombre'] = solicitud.usuario.nombre
            solicitud_dict['usuario_email'] = solicitud.usuario.email
            solicitudes_enriquecidas.append(solicitud_dict)
        
        return solicitudes_enriquecidas
        
    except Exception as e:
        logger.error(f"Error obteniendo solicitudes de upgrade: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.put("/admin/solicitudes-upgrade/{solicitud_id}", response_model=SolicitudUpgradeResponse)
def actualizar_solicitud_upgrade_endpoint(
    solicitud_id: int,
    solicitud_update: SolicitudUpgradeUpdate,
    db: Session = Depends(get_db),
    admin: UsuarioResponse = Depends(verificar_rol_admin)
):
    """
    Aprobar o rechazar una solicitud de upgrade (solo administradores)
    """
    try:
        db_solicitud = actualizar_solicitud_upgrade(db, solicitud_id, solicitud_update.dict())
        if not db_solicitud:
            raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
        # Enriquecer respuesta
        response_data = {**db_solicitud.__dict__}
        response_data['usuario_nombre'] = db_solicitud.usuario.nombre
        response_data['usuario_email'] = db_solicitud.usuario.email
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error actualizando solicitud: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    
# Manejo de errores global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error no manejado: {exc}")
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={
            "mensaje": "Error interno del servidor",
            "detalles": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )