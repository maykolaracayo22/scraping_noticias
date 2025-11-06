import requests
from bs4 import BeautifulSoup
from datetime import datetime, date
import time
import logging
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
import re
import random

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

    def _extraer_imagen_avanzada(self, articulo, base_url: str) -> Optional[str]:
        """Extrae imágenes usando múltiples estrategias"""
        try:
            # Estrategia 1: Buscar img con src válido
            img_elements = articulo.find_all('img')
            for img in img_elements:
                src = self._obtener_atributo_imagen(img)
                if src and self._es_imagen_valida(src):
                    imagen_url = self._construir_url_imagen(src, base_url)
                    if imagen_url:
                        return self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)
            
            # Estrategia 2: Buscar en elementos figure o con clases de imagen
            figure_elements = articulo.find_all(['figure', 'picture'])
            for figure in figure_elements:
                img = figure.find('img')
                if img:
                    src = self._obtener_atributo_imagen(img)
                    if src and self._es_imagen_valida(src):
                        imagen_url = self._construir_url_imagen(src, base_url)
                        if imagen_url:
                            return self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)
            
            # Estrategia 3: Buscar elementos con clases de imagen
            selectores_imagen = [
                '[class*="image"]',
                '[class*="photo"]',
                '[class*="img"]',
                '[class*="media"]',
                '[class*="thumb"]',
                '.news-image',
                '.story-image',
                '.post-thumbnail',
                '.entry-image'
            ]
            
            for selector in selectores_imagen:
                elementos = articulo.select(selector)
                for elemento in elementos:
                    img = elemento.find('img')
                    if img:
                        src = self._obtener_atributo_imagen(img)
                        if src and self._es_imagen_valida(src):
                            imagen_url = self._construir_url_imagen(src, base_url)
                            if imagen_url:
                                return self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)
            
            # Estrategia 4: Buscar elementos con background image
            elementos_con_bg = articulo.find_all(style=re.compile(r'background-image'))
            for elemento in elementos_con_bg:
                style = elemento.get('style', '')
                match = re.search(r'background-image:\s*url\([\'"]?(.*?)[\'"]?\)', style)
                if match:
                    src = match.group(1)
                    if self._es_imagen_valida(src):
                        imagen_url = self._construir_url_imagen(src, base_url)
                        if imagen_url:
                            return self._truncar_url(imagen_url, settings.MAX_URL_LENGTH)
            
            return None
            
        except Exception as e:
            logger.warning(f"Error extrayendo imagen: {e}")
            return None

    def _obtener_atributo_imagen(self, img_element) -> Optional[str]:
        """Obtiene la URL de la imagen de múltiples atributos"""
        atributos = ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-srcset']
        
        for attr in atributos:
            valor = img_element.get(attr)
            if valor:
                # Para srcset, tomar la primera imagen
                if attr == 'data-srcset' and ',' in valor:
                    valor = valor.split(',')[0].split(' ')[0]
                if self._es_imagen_valida(valor):
                    return valor
        
        return None

    def _es_imagen_valida(self, url: str) -> bool:
        """Verifica si la URL parece ser una imagen válida"""
        if not url or url.strip() == '':
            return False
        
        # Excluir imágenes placeholder o muy pequeñas
        excluir_patrones = [
            'placeholder', 'blank', 'spacer', 'pixel',
            'logo', 'icon', 'avatar', 'thumb',
            '/1x1.', '/pixel.', 'data:image/svg'
        ]
        
        for patron in excluir_patrones:
            if patron in url.lower():
                return False
        
        # Verificar extensiones de imagen
        extensiones_imagen = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
        url_lower = url.lower()
        
        for ext in extensiones_imagen:
            if ext in url_lower:
                return True
        
        # Si no tiene extensión pero parece una URL de imagen
        if any(domain in url_lower for domain in ['/imagenes/', '/images/', '/img/', '/fotos/']):
            return True
        
        return False

    def _construir_url_imagen(self, src: str, base_url: str) -> str:
        """Construye la URL completa de la imagen"""
        if src.startswith(('http://', 'https://', '//')):
            if src.startswith('//'):
                return 'https:' + src
            return src
        else:
            return urljoin(base_url, src)

    def _obtener_contenido_y_imagen_principal(self, url: str) -> tuple[str, Optional[str]]:
        """Obtiene contenido e imagen principal de una noticia individual"""
        try:
            response = self.session.get(url, timeout=settings.REQUEST_TIMEOUT)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Eliminar scripts y estilos
            for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
                script.decompose()
            
            # 1. Extraer imagen principal de la página
            imagen_principal = None
            
            # Buscar imagen principal con múltiples estrategias
            selectores_imagen_principal = [
                'meta[property="og:image"]',
                'meta[name="twitter:image"]',
                '.main-image',
                '.featured-image',
                '.article-image',
                '.story-image',
                '.news-image',
                '.post-thumbnail',
                'figure img',
                '.content img',
                '.entry-content img'
            ]
            
            for selector in selectores_imagen_principal:
                elementos = soup.select(selector)
                for elemento in elementos:
                    if elemento.name == 'meta':
                        src = elemento.get('content', '')
                    else:
                        src = elemento.get('src') or elemento.get('data-src')
                    
                    if src and self._es_imagen_valida(src):
                        imagen_principal = self._construir_url_imagen(src, url)
                        break
                
                if imagen_principal:
                    break
            
            # 2. Extraer contenido
            contenido_texto = ""
            selectores_contenido = [
                'article',
                '.story-content',
                '.noticia-content',
                '.entry-content',
                '.post-content',
                '.news-content',
                '[class*="content"]',
                '[class*="body"]',
                '[class*="noticia"]',
                '[class*="story"]',
                'main',
                '.detail-content',
                '.article-content',
                '.news-detail',
                '.nota'
            ]
            
            for selector in selectores_contenido:
                elementos = soup.select(selector)
                for elemento in elementos:
                    # Buscar párrafos dentro del elemento
                    parrafos = elemento.find_all('p')
                    texto = ' '.join([p.get_text().strip() for p in parrafos if p.get_text().strip()])
                    if len(texto) > 100:  # Si tiene contenido significativo
                        contenido_texto = texto
                        break
                if contenido_texto:
                    break
            
            # Si no encontramos con selectores, buscar por estructura común
            if not contenido_texto:
                # Buscar el elemento con más párrafos
                todos_parrafos = soup.find_all('p')
                textos = [p.get_text().strip() for p in todos_parrafos if len(p.get_text().strip()) > 20]
                contenido_texto = ' '.join(textos[:10])  # Limitar a 10 párrafos
            
            return contenido_texto, imagen_principal
            
        except Exception as e:
            logger.warning(f"Error obteniendo contenido e imagen {url}: {e}")
            return "", None

    # ==================== RPP ====================
    def scrape_rpp(self) -> List[Dict]:
        """Scraper para RPP Noticias"""
        noticias = []
        try:
            response = self.session.get(settings.NEWS_SOURCES['rpp'], timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selectores específicos para RPP
            selectores = [
                'article',
                '.news-item',
                '.story',
                '.noticia',
                '[data-type="news"]',
                '.highlighted-news',
                '.news-list-item'
            ]
            
            articulos = []
            for selector in selectores:
                articulos.extend(soup.select(selector))
                if articulos:
                    break
            
            for articulo in articulos[:15]:
                try:
                    noticia_data = self._extraer_datos_rpp(articulo)
                    if noticia_data and noticia_data['titulo']:
                        noticias.append(noticia_data)
                except Exception as e:
                    logger.warning(f"Error extrayendo artículo RPP: {e}")
                    continue
                
                time.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Error en scrape_rpp: {e}")
        
        return noticias

    def _extraer_datos_rpp(self, articulo) -> Optional[Dict]:
        """Extrae datos específicos de un artículo de RPP"""
        # Múltiples estrategias para encontrar el título
        titulo = None
        titulo_selectores = ['h2', 'h3', 'h4', '.title', '.news-title', 'a']
        
        for selector in titulo_selectores:
            titulo_elem = articulo.find(selector)
            if titulo_elem and titulo_elem.get_text().strip():
                titulo = titulo_elem.get_text().strip()
                break
        
        if not titulo:
            return None
        
        # Enlace
        enlace_elem = articulo.find('a')
        if not enlace_elem or not enlace_elem.get('href'):
            return None
            
        enlace = urljoin(settings.NEWS_SOURCES['rpp'], enlace_elem['href'])
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)
        
        # Imagen - usando el nuevo método
        imagen_url = self._extraer_imagen_avanzada(articulo, settings.NEWS_SOURCES['rpp'])
        
        # Obtener contenido e imagen de la página individual
        contenido, imagen_pagina = self._obtener_contenido_y_imagen_principal(enlace)
        
        # Usar la imagen de la página individual si no encontramos en el listado
        if not imagen_url and imagen_pagina:
            imagen_url = self._truncar_url(imagen_pagina, settings.MAX_URL_LENGTH)
        
        categoria = clasificador.clasificar_noticia(titulo, contenido, enlace)
        
        return {
            'titulo': titulo,
            'enlace': enlace,
            'fecha': date.today(),
            'contenido': contenido[:settings.MAX_CONTENT_LENGTH],
            'imagen_url': imagen_url,
            'fuente': 'RPP',
            'categoria': categoria
        }

    # ==================== TROME ====================
    def scrape_trome(self) -> List[Dict]:
        """Scraper para Trome - Mejorado"""
        noticias = []
        try:
            # Trome puede requerir headers específicos
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
            
            response = self.session.get(settings.NEWS_SOURCES['trome'], headers=headers, timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selectores específicos para Trome
            selectores = [
                'article',
                '.news-item',
                '.story',
                '.noticia',
                '.news-list-item',
                '.entry',
                '.post',
                '[class*="nota"]',
                '[class*="news"]'
            ]
            
            articulos = []
            for selector in selectores:
                encontrados = soup.select(selector)
                articulos.extend(encontrados)
                logger.info(f"Trome - Selector {selector}: {len(encontrados)} elementos")
            
            # Si no encontramos con selectores, buscar por estructura común
            if not articulos:
                # Buscar elementos que parezcan noticias por estructura
                posibles_noticias = soup.find_all(['div', 'section'], class_=re.compile(r'news|noticia|story|entry', re.I))
                articulos = posibles_noticias
                logger.info(f"Trome - Búsqueda por clase: {len(articulos)} elementos")
            
            for articulo in articulos[:15]:
                try:
                    noticia_data = self._extraer_datos_trome(articulo)
                    if noticia_data and noticia_data['titulo']:
                        noticias.append(noticia_data)
                        logger.info(f"Trome - Noticia extraída: {noticia_data['titulo'][:50]}...")
                except Exception as e:
                    logger.warning(f"Error extrayendo artículo Trome: {e}")
                    continue
                
                time.sleep(0.2)  # Pausa más larga para Trome
            
        except Exception as e:
            logger.error(f"Error en scrape_trome: {e}")
        
        return noticias

    def _extraer_datos_trome(self, articulo) -> Optional[Dict]:
        """Extrae datos específicos de un artículo de Trome"""
        # Estrategias múltiples para título
        titulo = None
        
        # Buscar en headings
        for tag in ['h1', 'h2', 'h3', 'h4', 'h5']:
            titulo_elem = articulo.find(tag)
            if titulo_elem and titulo_elem.get_text().strip():
                titulo = titulo_elem.get_text().strip()
                break
        
        # Buscar en enlaces con texto significativo
        if not titulo:
            enlaces = articulo.find_all('a')
            for enlace in enlaces:
                texto = enlace.get_text().strip()
                if len(texto) > 10 and len(texto) < 200:  # Texto que parece título
                    titulo = texto
                    break
        
        if not titulo:
            return None
        
        # Enlace
        enlace_elem = articulo.find('a')
        if not enlace_elem or not enlace_elem.get('href'):
            # Buscar cualquier enlace en el artículo
            enlaces = articulo.find_all('a')
            for enlace in enlaces:
                if enlace.get('href') and len(enlace.get_text().strip()) > 10:
                    enlace_elem = enlace
                    break
        
        if not enlace_elem or not enlace_elem.get('href'):
            return None
            
        enlace = urljoin(settings.NEWS_SOURCES['trome'], enlace_elem['href'])
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)
        
        # Imagen - usando el nuevo método
        imagen_url = self._extraer_imagen_avanzada(articulo, settings.NEWS_SOURCES['trome'])
        
        # Obtener contenido e imagen de la página individual
        contenido, imagen_pagina = self._obtener_contenido_y_imagen_principal(enlace)
        
        # Usar la imagen de la página individual si no encontramos en el listado
        if not imagen_url and imagen_pagina:
            imagen_url = self._truncar_url(imagen_pagina, settings.MAX_URL_LENGTH)
        
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

    # ==================== EL COMERCIO ====================
    def scrape_el_comercio(self) -> List[Dict]:
        """Scraper para El Comercio - Mejorado"""
        noticias = []
        try:
            # El Comercio puede tener protección más estricta
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            }
            
            response = self.session.get(settings.NEWS_SOURCES['el_comercio'], headers=headers, timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selectores específicos para El Comercio
            selectores = [
                'article',
                '.story',
                '.news-item',
                '[data-type="story"]',
                '.feed-item',
                '.news-feed-item',
                '[class*="noticia"]',
                '[class*="story"]'
            ]
            
            articulos = []
            for selector in selectores:
                encontrados = soup.select(selector)
                articulos.extend(encontrados)
                logger.info(f"El Comercio - Selector {selector}: {len(encontrados)} elementos")
            
            # Estrategia de respaldo: buscar por estructura
            if not articulos:
                # Buscar elementos con estructura de noticia
                elementos_con_enlaces = soup.find_all(['div', 'section'], 
                                                    string=False,  # Excluir elementos que solo contienen texto
                                                    recursive=True)
                
                for elemento in elementos_con_enlaces:
                    # Verificar si parece una noticia
                    enlaces = elemento.find_all('a')
                    titulos = elemento.find_all(['h1', 'h2', 'h3', 'h4'])
                    
                    if len(enlaces) >= 1 and len(titulos) >= 1:
                        articulos.append(elemento)
                
                logger.info(f"El Comercio - Búsqueda por estructura: {len(articulos)} elementos")
            
            for articulo in articulos[:15]:
                try:
                    noticia_data = self._extraer_datos_el_comercio(articulo)
                    if noticia_data and noticia_data['titulo']:
                        noticias.append(noticia_data)
                        logger.info(f"El Comercio - Noticia extraída: {noticia_data['titulo'][:50]}...")
                except Exception as e:
                    logger.warning(f"Error extrayendo artículo El Comercio: {e}")
                    continue
                
                time.sleep(0.3)  # Pausa más larga para El Comercio
            
        except Exception as e:
            logger.error(f"Error en scrape_el_comercio: {e}")
        
        return noticias

    def _extraer_datos_el_comercio(self, articulo) -> Optional[Dict]:
        """Extrae datos específicos de un artículo de El Comercio"""
        # Estrategias múltiples para título
        titulo = None
        
        # Buscar en headings con clases específicas
        heading_selectores = [
            'h1', 'h2', 'h3', 'h4',
            '[class*="title"]',
            '[class*="headline"]',
            '.story-title',
            '.news-title'
        ]
        
        for selector in heading_selectores:
            elementos = articulo.select(selector)
            for elem in elementos:
                texto = elem.get_text().strip()
                if texto and 10 < len(texto) < 200:
                    titulo = texto
                    break
            if titulo:
                break
        
        # Buscar en enlaces con texto significativo
        if not titulo:
            enlaces = articulo.find_all('a')
            for enlace in enlaces:
                texto = enlace.get_text().strip()
                # Filtrar textos que parecen títulos
                if (10 < len(texto) < 200 and 
                    not texto.isupper() and  # Excluir MENÚ, INICIO, etc.
                    not re.search(r'^\d+$', texto)):  # Excluir números solos
                    titulo = texto
                    break
        
        if not titulo:
            return None
        
        # Enlace
        enlace_elem = None
        if titulo:
            # Buscar el enlace que contiene el título o está cerca
            enlaces = articulo.find_all('a')
            for enlace in enlaces:
                if (enlace.get_text().strip() == titulo or 
                    titulo in enlace.get_text().strip()):
                    enlace_elem = enlace
                    break
            
            # Si no encontramos, usar el primer enlace con href válido
            if not enlace_elem:
                for enlace in enlaces:
                    href = enlace.get('href')
                    if href and not href.startswith(('#', 'javascript:')):
                        enlace_elem = enlace
                        break
        
        if not enlace_elem or not enlace_elem.get('href'):
            return None
            
        enlace = urljoin(settings.NEWS_SOURCES['el_comercio'], enlace_elem['href'])
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)
        
        # Imagen - usando el nuevo método
        imagen_url = self._extraer_imagen_avanzada(articulo, settings.NEWS_SOURCES['el_comercio'])
        
        # Obtener contenido e imagen de la página individual
        contenido, imagen_pagina = self._obtener_contenido_y_imagen_principal(enlace)
        
        # Usar la imagen de la página individual si no encontramos en el listado
        if not imagen_url and imagen_pagina:
            imagen_url = self._truncar_url(imagen_pagina, settings.MAX_URL_LENGTH)
        
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

    # ==================== DIARIO SIN FRONTERAS ====================
    def scrape_diario_sin_fronteras(self) -> List[Dict]:
        """Scraper para Diario Sin Fronteras"""
        noticias = []
        try:
            response = self.session.get(settings.NEWS_SOURCES['diario_sin_fronteras'], timeout=settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selectores para Diario Sin Fronteras
            selectores = [
                'article',
                '.news-item',
                '.story',
                '.noticia',
                '.post',
                '.entry'
            ]
            
            articulos = []
            for selector in selectores:
                articulos.extend(soup.select(selector))
                if articulos:
                    break
            
            for articulo in articulos[:15]:
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
        enlace = self._truncar_url(enlace, settings.MAX_URL_LENGTH)
        
        # Imagen - usando el nuevo método
        imagen_url = self._extraer_imagen_avanzada(articulo, settings.NEWS_SOURCES['diario_sin_fronteras'])
        
        # Obtener contenido e imagen de la página individual
        contenido, imagen_pagina = self._obtener_contenido_y_imagen_principal(enlace)
        
        # Usar la imagen de la página individual si no encontramos en el listado
        if not imagen_url and imagen_pagina:
            imagen_url = self._truncar_url(imagen_pagina, settings.MAX_URL_LENGTH)
        
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

    def ejecutar_scraping_completo(self) -> List[Dict]:
        """Ejecuta scraping de todas las fuentes"""
        todas_noticias = []
        
        logger.info("Iniciando scraping de RPP...")
        noticias_rpp = self.scrape_rpp()
        todas_noticias.extend(noticias_rpp)
        logger.info(f"RPP: {len(noticias_rpp)} noticias obtenidas")
        time.sleep(settings.DELAY_BETWEEN_REQUESTS)
        
        logger.info("Iniciando scraping de Trome...")
        noticias_trome = self.scrape_trome()
        todas_noticias.extend(noticias_trome)
        logger.info(f"Trome: {len(noticias_trome)} noticias obtenidas")
        time.sleep(settings.DELAY_BETWEEN_REQUESTS)
        
        logger.info("Iniciando scraping de El Comercio...")
        noticias_el_comercio = self.scrape_el_comercio()
        todas_noticias.extend(noticias_el_comercio)
        logger.info(f"El Comercio: {len(noticias_el_comercio)} noticias obtenidas")
        time.sleep(settings.DELAY_BETWEEN_REQUESTS)
        
        logger.info("Iniciando scraping de Diario Sin Fronteras...")
        noticias_dsf = self.scrape_diario_sin_fronteras()
        todas_noticias.extend(noticias_dsf)
        logger.info(f"Diario Sin Fronteras: {len(noticias_dsf)} noticias obtenidas")
        
        # Resumen final
        logger.info(f"Scraping completado. Total de noticias obtenidas: {len(todas_noticias)}")
        logger.info(f"Resumen por fuente: RPP({len(noticias_rpp)}), Trome({len(noticias_trome)}), El Comercio({len(noticias_el_comercio)}), DSF({len(noticias_dsf)})")
        
        return todas_noticias

# Instancia global del scraper
scraper = ScraperNoticias()