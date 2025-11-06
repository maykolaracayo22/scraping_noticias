import sys
import os
from pathlib import Path

# Agregar el directorio padre al path para imports
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import asyncio

# Importaciones locales
from app import models, schemas, crud, scraper, database
from app.database import get_db, create_tables

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
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evento de inicio: crear tablas
@app.on_event("startup")
def startup_event():
    create_tables()
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

# Manejo de errores global - CORREGIDO
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error no manejado: {exc}")
    from fastapi.responses import JSONResponse  # ✅ Añadir este import
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