import requests
from bs4 import BeautifulSoup
from datetime import datetime, date
import time
import logging
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
import re

from app.config import settings
from app.classification import clasificador

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperNoticias:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(settings.HEADERS)
    
    def _truncar_url(self, url: str, max_length: int = 500) -> str:
        """Trunca la URL si es demasiado larga para MySQL"""
        if len(url) > max_length:
            # Mantener el inicio y el final de la URL
            parte_media = max_length - 100
            if parte_media > 0:
                truncated = url[:50] + "..." + url[-parte_media:]
            else:
                truncated = url[:max_length]
            logger.warning(f"URL truncada de {len(url)} a {len(truncated)} caracteres")
            return truncated
        return url

    def _extraer_datos_rpp(self, articulo) -> Optional[Dict]:
        """Extrae datos específicos de un artículo de RPP"""
        # Título
        titulo_elem = articulo.find(['h2', 'h3', 'h4']) or articulo.find('a')
        if not titulo_elem:
            return None
            
        titulo = titulo_elem.get_text().strip()
        if not titulo:
            return None
        
        # Enlace
        enlace_elem = articulo.find('a')
        if not enlace_elem or not enlace_elem.get('href'):
            return None
            
        enlace = urljoin(settings.NEWS_SOURCES['rpp'], enlace_elem['href'])
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)  # Nueva línea
        
        # Imagen
        imagen_elem = articulo.find('img')
        imagen_url = imagen_elem['src'] if imagen_elem and imagen_elem.get('src') else None
        if imagen_url and not imagen_url.startswith(('http', '//')):
            imagen_url = urljoin(settings.NEWS_SOURCES['rpp'], imagen_url)
            imagen_url = self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)  # Nueva línea
        
        # Contenido (hacer request a la página individual)
        contenido = self._obtener_contenido_rpp(enlace)
        
        # Clasificar categoría
        categoria = clasificador.clasificar_noticia(titulo, contenido, enlace)
        
        return {
            'titulo': titulo,
            'enlace': enlace,
            'fecha': date.today(),  # RPP no siempre muestra fecha en listado
            'contenido': contenido[:settings.MAX_CONTENT_LENGTH],
            'imagen_url': imagen_url,
            'fuente': 'RPP',
            'categoria': categoria
        }
    
    def _extraer_datos_trome(self, articulo) -> Optional[Dict]:
        """Extrae datos específicos de un artículo de Trome"""
        titulo_elem = articulo.find(['h2', 'h3', 'h4']) or articulo.find('a')
        if not titulo_elem:
            return None
            
        titulo = titulo_elem.get_text().strip()
        if not titulo:
            return None
        
        enlace_elem = articulo.find('a')
        if not enlace_elem or not enlace_elem.get('href'):
            return None
            
        enlace = urljoin(settings.NEWS_SOURCES['trome'], enlace_elem['href'])
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)  # Nueva línea
        
        imagen_elem = articulo.find('img')
        imagen_url = imagen_elem['src'] if imagen_elem and imagen_elem.get('src') else None
        if imagen_url and not imagen_url.startswith(('http', '//')):
            imagen_url = urljoin(settings.NEWS_SOURCES['trome'], imagen_url)
            imagen_url = self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)  # Nueva línea
        
        contenido = self._obtener_contenido_generico(enlace)
        categoria = clasificador.clasificar_noticia(titulo, contenido, enlace)
        
        return {
            'titulo': titulo,
            'enlace': enlace,
            'fecha': date.today(),
            'contenido': contenido[:settings.MAX_CONTENT_LENGTH],
            'imagen_url': imagen_url,
            'fuente': 'Trome',
            'categoria': categoria
        }
    
    def _extraer_datos_el_comercio(self, articulo) -> Optional[Dict]:
        """Extrae datos específicos de un artículo de El Comercio"""
        titulo_elem = articulo.find(['h2', 'h3', 'h4']) or articulo.find('a')
        if not titulo_elem:
            return None
            
        titulo = titulo_elem.get_text().strip()
        if not titulo:
            return None
        
        enlace_elem = articulo.find('a')
        if not enlace_elem or not enlace_elem.get('href'):
            return None
            
        enlace = urljoin(settings.NEWS_SOURCES['el_comercio'], enlace_elem['href'])
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)  # Nueva línea
        
        imagen_elem = articulo.find('img')
        imagen_url = imagen_elem['src'] if imagen_elem and imagen_elem.get('src') else None
        if imagen_url and not imagen_url.startswith(('http', '//')):
            imagen_url = urljoin(settings.NEWS_SOURCES['el_comercio'], imagen_url)
            imagen_url = self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)  # Nueva línea
        
        contenido = self._obtener_contenido_generico(enlace)
        categoria = clasificador.clasificar_noticia(titulo, contenido, enlace)
        
        return {
            'titulo': titulo,
            'enlace': enlace,
            'fecha': date.today(),
            'contenido': contenido[:settings.MAX_CONTENT_LENGTH],
            'imagen_url': imagen_url,
            'fuente': 'El Comercio',
            'categoria': categoria
        }
    
    def _extraer_datos_dsf(self, articulo) -> Optional[Dict]:
        """Extrae datos específicos de un artículo de Diario Sin Fronteras"""
        titulo_elem = articulo.find(['h2', 'h3', 'h4']) or articulo.find('a')
        if not titulo_elem:
            return None
            
        titulo = titulo_elem.get_text().strip()
        if not titulo:
            return None
        
        enlace_elem = articulo.find('a')
        if not enlace_elem or not enlace_elem.get('href'):
            return None
            
        enlace = urljoin(settings.NEWS_SOURCES['diario_sin_fronteras'], enlace_elem['href'])
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)  # Nueva línea
        
        imagen_elem = articulo.find('img')
        imagen_url = imagen_elem['src'] if imagen_elem and imagen_elem.get('src') else None
        if imagen_url and not imagen_url.startswith(('http', '//')):
            imagen_url = urljoin(settings.NEWS_SOURCES['diario_sin_fronteras'], imagen_url)
            imagen_url = self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)  # Nueva línea
        
        contenido = self._obtener_contenido_generico(enlace)
        categoria = clasificador.clasificar_noticia(titulo, contenido, enlace)
        
        return {
            'titulo': titulo,
            'enlace': enlace,
            'fecha': date.today(),
            'contenido': contenido[:settings.MAX_CONTENT_LENGTH],
            'imagen_url': imagen_url,
            'fuente': 'Diario Sin Fronteras',
            'categoria': categoria
        }

    # ... (el resto del código de la clase ScraperNoticias se mantiene igual)
    def _obtener_contenido_rpp(self, url: str) -> str:
        """Obtiene contenido completo de una noticia individual de RPP"""
        try:
            response = self.session.get(url, timeout=settings.REQUEST_TIMEOUT)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar contenido en diferentes selectores comunes
            contenido_elem = (soup.find('article') or 
                            soup.find('div', class_=re.compile('content|body|noticia')) or
                            soup.find('div', id=re.compile('content|body')))
            
            if contenido_elem:
                # Extraer texto de párrafos
                parrafos = contenido_elem.find_all('p')
                texto = ' '.join([p.get_text().strip() for p in parrafos if p.get_text().strip()])
                return texto
            
        except Exception as e:
            logger.warning(f"Error obteniendo contenido RPP {url}: {e}")
        
        return ""
    
    def scrape_rpp(self) -> List[Dict]:
        """Scraper para RPP Noticias"""
        noticias = []
        try:
            response = self.session.get(settings.NEWS_SOURCES['rpp'], timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar artículos (selectores comunes en RPP)
            articulos = soup.find_all('article') or soup.select('.news-item, .story, .noticia')
            
            for articulo in articulos[:20]:  # Limitar a 20 noticias
                try:
                    noticia_data = self._extraer_datos_rpp(articulo)
                    if noticia_data and noticia_data['titulo']:
                        noticias.append(noticia_data)
                except Exception as e:
                    logger.warning(f"Error extrayendo artículo RPP: {e}")
                    continue
                
                time.sleep(0.1)  # Pequeña pausa entre artículos
            
        except Exception as e:
            logger.error(f"Error en scrape_rpp: {e}")
        
        return noticias
    
    def scrape_trome(self) -> List[Dict]:
        """Scraper para Trome"""
        noticias = []
        try:
            response = self.session.get(settings.NEWS_SOURCES['trome'], timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar artículos en Trome
            articulos = soup.find_all('article') or soup.select('.news-item, .story, .noticia, .item')
            
            for articulo in articulos[:20]:
                try:
                    noticia_data = self._extraer_datos_trome(articulo)
                    if noticia_data and noticia_data['titulo']:
                        noticias.append(noticia_data)
                except Exception as e:
                    logger.warning(f"Error extrayendo artículo Trome: {e}")
                    continue
                
                time.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Error en scrape_trome: {e}")
        
        return noticias
    
    def scrape_el_comercio(self) -> List[Dict]:
        """Scraper para El Comercio"""
        noticias = []
        try:
            response = self.session.get(settings.NEWS_SOURCES['el_comercio'], timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            articulos = soup.find_all('article') or soup.select('.story, .news-item, .noticia')
            
            for articulo in articulos[:20]:
                try:
                    noticia_data = self._extraer_datos_el_comercio(articulo)
                    if noticia_data and noticia_data['titulo']:
                        noticias.append(noticia_data)
                except Exception as e:
                    logger.warning(f"Error extrayendo artículo El Comercio: {e}")
                    continue
                
                time.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Error en scrape_el_comercio: {e}")
        
        return noticias
    
    def scrape_diario_sin_fronteras(self) -> List[Dict]:
        """Scraper para Diario Sin Fronteras"""
        noticias = []
        try:
            response = self.session.get(settings.NEWS_SOURCES['diario_sin_fronteras'], timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            articulos = soup.find_all('article') or soup.select('.news-item, .story, .noticia, .post')
            
            for articulo in articulos[:20]:
                try:
                    noticia_data = self._extraer_datos_dsf(articulo)
                    if noticia_data and noticia_data['titulo']:
                        noticias.append(noticia_data)
                except Exception as e:
                    logger.warning(f"Error extrayendo artículo Diario Sin Fronteras: {e}")
                    continue
                
                time.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Error en scrape_diario_sin_fronteras: {e}")
        
        return noticias
    
    def _obtener_contenido_generico(self, url: str) -> str:
        """Método genérico para obtener contenido de noticias"""
        try:
            response = self.session.get(url, timeout=settings.REQUEST_TIMEOUT)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar contenido en diferentes selectores comunes
            selectores = [
                'article',
                '.content',
                '.story-content',
                '.noticia-content',
                '.entry-content',
                '.post-content',
                'main',
                '[class*="content"]',
                '[class*="body"]'
            ]
            
            for selector in selectores:
                contenido_elem = soup.select_one(selector)
                if contenido_elem:
                    parrafos = contenido_elem.find_all('p')
                    texto = ' '.join([p.get_text().strip() for p in parrafos if p.get_text().strip()])
                    if texto:
                        return texto
            
        except Exception as e:
            logger.warning(f"Error obteniendo contenido genérico {url}: {e}")
        
        return ""
    
    def ejecutar_scraping_completo(self) -> List[Dict]:
        """Ejecuta scraping de todas las fuentes"""
        todas_noticias = []
        
        logger.info("Iniciando scraping de RPP...")
        noticias_rpp = self.scrape_rpp()
        todas_noticias.extend(noticias_rpp)
        time.sleep(settings.DELAY_BETWEEN_REQUESTS)
        
        logger.info("Iniciando scraping de Trome...")
        noticias_trome = self.scrape_trome()
        todas_noticias.extend(noticias_trome)
        time.sleep(settings.DELAY_BETWEEN_REQUESTS)
        
        logger.info("Iniciando scraping de El Comercio...")
        noticias_el_comercio = self.scrape_el_comercio()
        todas_noticias.extend(noticias_el_comercio)
        time.sleep(settings.DELAY_BETWEEN_REQUESTS)
        
        logger.info("Iniciando scraping de Diario Sin Fronteras...")
        noticias_dsf = self.scrape_diario_sin_fronteras()
        todas_noticias.extend(noticias_dsf)
        
        logger.info(f"Scraping completado. Total de noticias obtenidas: {len(todas_noticias)}")
        return todas_noticias

# Instancia global del scraper
scraper = ScraperNoticias()