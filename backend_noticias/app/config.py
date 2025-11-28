import os
from typing import Dict, Any, List

class Settings:
    # Configuración de MySQL (Laragon) - NUEVA BASE DE DATOS
    DB_HOST: str = "localhost"
    DB_PORT: str = "3306"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "news_aggregator_reddit"  # ✅ NUEVO NOMBRE
    
    # Configuración de Scraping
    REQUEST_TIMEOUT: int = 10
    DELAY_BETWEEN_REQUESTS: float = 0.7
    MAX_CONTENT_LENGTH: int = 1500
    MAX_URL_LENGTH: int = 500
    
    # Headers para scraping
    HEADERS: Dict[str, str] = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    # URLs de las fuentes de noticias
    NEWS_SOURCES: Dict[str, str] = {
        'rpp': 'https://rpp.pe',
        'trome': 'https://trome.com',
        'el_comercio': 'https://elcomercio.pe',
        'diario_sin_fronteras': 'https://diariosinfronteras.pe',
        'reddit': 'https://www.reddit.com'  # ✅ NUEVO
    }
    
    # ✅ NUEVA CONFIGURACIÓN PARA REDDIT
    REDDIT_SUBREDDITS: List[str] = [
        'worldnews',      # Noticias internacionales
        'news',           # Noticias generales
        'technology',     # Tecnología
        'science',        # Ciencia
        'politics',       # Política
        'economics',      # Economía
        'sports',         # Deportes
        'health',         # Salud
        'programming',    # Programación
        'MachineLearning' # Machine Learning
    ]
    
    REDDIT_SORT: str = 'hot'    # hot, new, top, rising
    REDDIT_LIMIT: int = 15      # Posts por subreddit
    REDDIT_WEB_DELAY: float = 0.5  # Delay entre requests a Reddit
    
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()