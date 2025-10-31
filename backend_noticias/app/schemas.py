from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Dict, Any

# Schemas para Noticias
class NoticiaBase(BaseModel):
    titulo: str
    enlace: str
    fecha: date
    categoria: str
    contenido: Optional[str] = None
    imagen_url: Optional[str] = None
    fuente: str

class NoticiaCreate(NoticiaBase):
    pass

class Noticia(NoticiaBase):
    id: int
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

# Schemas para Respuestas API
class EstadisticasResponse(BaseModel):
    total_noticias: int
    categorias: Dict[str, int]
    fuentes: Dict[str, int]
    ultima_actualizacion: Optional[datetime]

class ScrapingResponse(BaseModel):
    mensaje: str
    noticias_obtenidas: int
    noticias_guardadas: int
    duplicados: int
    errores: int

class MensajeResponse(BaseModel):
    mensaje: str
    detalles: Optional[Dict[str, Any]] = None