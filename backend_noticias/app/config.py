import os
from typing import Dict, Any

class Settings:
    # Configuración de MySQL (Laragon)
    DB_HOST: str = "localhost"
    DB_PORT: str = "3306"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""  # Laragon usualmente tiene password vacío
    DB_NAME: str = "news_aggregator"
    
    # Configuración de Scraping
    REQUEST_TIMEOUT: int = 10
    DELAY_BETWEEN_REQUESTS: float = 0.7  # segundos
    MAX_CONTENT_LENGTH: int = 1500
    MAX_URL_LENGTH: int = 500  # Nueva configuración para longitud máxima de URLs
    
    # Headers para scraping
    HEADERS: Dict[str, str] = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # URLs de las fuentes de noticias
    NEWS_SOURCES: Dict[str, str] = {
        'rpp': 'https://rpp.pe',
        'trome': 'https://trome.pe',
        'el_comercio': 'https://elcomercio.pe',
        'diario_sin_fronteras': 'https://diariosinfronteras.pe'
    }
    
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()