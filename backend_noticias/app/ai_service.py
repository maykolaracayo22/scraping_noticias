import os
import requests
from dotenv import load_dotenv
import logging
from typing import Dict, Any
import json

load_dotenv()
logger = logging.getLogger(__name__)

class LegacyAIAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        if not self.api_key:
            logger.error("GOOGLE_AI_API_KEY no encontrada")
            raise ValueError("API key no configurada")
        
        # URL para la API legacy de Gemini
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.api_key}"
        logger.info("✅ Analizador Legacy inicializado")

    def analizar_noticia(self, titulo: str, contenido: str) -> Dict[str, Any]:
        """
        Analiza noticias usando la API legacy de Gemini
        """
        try:
            # Preparar el prompt
            prompt = self._crear_prompt(titulo, contenido)
            
            # Preparar los datos para la API
            data = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }
            
            # Hacer la petición a la API
            response = requests.post(self.url, json=data, timeout=30)
            response.raise_for_status()
            
            # Procesar la respuesta
            result = response.json()
            texto_respuesta = result['candidates'][0]['content']['parts'][0]['text']
            
            # Parsear la respuesta
            return self._parsear_respuesta(texto_respuesta, titulo)
            
        except Exception as e:
            logger.error(f"❌ Error en análisis Legacy: {e}")
            return self._analisis_por_defecto(titulo)

    def _crear_prompt(self, titulo: str, contenido: str) -> str:
        """Crea el prompt para la IA"""
        return f"""
        Analiza esta noticia y devuelve SOLO un JSON válido:

        TÍTULO: {titulo}
        CONTENIDO: {contenido[:2000] if contenido else "Sin contenido"}

        Estructura JSON requerida:
        {{
            "resumen": "Resumen conciso de 2-3 líneas en español",
            "categoria": "Política|Economía|Deportes|Tecnología|Salud|Entretenimiento|Ciencia|General",
            "sentimiento": "positivo|negativo|neutral",
            "temas_principales": ["tema1", "tema2", "tema3"],
            "puntuacion_importancia": 5,
            "palabras_clave": ["palabra1", "palabra2", "palabra3"]
        }}

        Reglas:
        - Resumen objetivo y factual
        - Categoría más apropiada
        - Sentimiento basado en el tono
        - Solo responder con JSON válido
        """

    def _parsear_respuesta(self, texto_respuesta: str, titulo: str) -> Dict[str, Any]:
        """Parsea la respuesta de la IA"""
        try:
            # Limpiar la respuesta
            texto_limpio = texto_respuesta.strip()
            if '```json' in texto_limpio:
                texto_limpio = texto_limpio.split('```json')[1].split('```')[0].strip()
            elif '```' in texto_limpio:
                texto_limpio = texto_limpio.split('```')[1].split('```')[0].strip()
            
            # Parsear JSON
            analisis = json.loads(texto_limpio)
            logger.info("✅ Análisis Legacy completado exitosamente")
            return analisis
            
        except json.JSONDecodeError:
            logger.error("❌ Error parseando JSON, usando análisis básico")
            return self._analisis_basico(titulo)

    def _analisis_basico(self, titulo: str) -> Dict[str, Any]:
        """Análisis básico cuando falla la IA"""
        categorias_keywords = {
            'Política': ['política', 'gobierno', 'presidente', 'congreso', 'ley', 'elección', 'ministro', 'estado'],
            'Economía': ['economía', 'económico', 'mercado', 'finanzas', 'dólar', 'inflación', 'empresa', 'precio'],
            'Deportes': ['deporte', 'fútbol', 'partido', 'jugador', 'competencia', 'equipo', 'liga', 'gol'],
            'Tecnología': ['tecnología', 'digital', 'internet', 'app', 'software', 'inteligencia', 'ciber', 'redes'],
            'Salud': ['salud', 'médico', 'hospital', 'enfermedad', 'virus', 'vacuna', 'paciente', 'medicina'],
            'Entretenimiento': ['entretenimiento', 'celebridad', 'película', 'música', 'show', 'actor', 'cantante', 'serie'],
            'Ciencia': ['ciencia', 'investigación', 'estudio', 'descubrimiento', 'científico', 'espacio', 'tecnología']
        }
        
        titulo_lower = titulo.lower()
        categoria = 'General'
        
        for cat, keywords in categorias_keywords.items():
            if any(keyword in titulo_lower for keyword in keywords):
                categoria = cat
                break
        
        palabras_excluidas = ['de', 'la', 'el', 'en', 'y', 'a', 'que', 'se', 'con', 'por', 'para', 'los', 'las']
        palabras_clave = [palabra for palabra in titulo.split()[:8] 
                         if palabra.lower() not in palabras_excluidas and len(palabra) > 3]
        
        return {
            "resumen": f"Análisis automático: {titulo}",
            "categoria": categoria,
            "sentimiento": "neutral",
            "temas_principales": [categoria],
            "puntuacion_importancia": 6,
            "palabras_clave": palabras_clave[:5]
        }

    def _analisis_por_defecto(self, titulo: str) -> Dict[str, Any]:
        """Análisis por defecto para errores"""
        return {
            "resumen": f"Análisis de: {titulo}",
            "categoria": "General",
            "sentimiento": "neutral",
            "temas_principales": ["Información general"],
            "puntuacion_importancia": 5,
            "palabras_clave": ["noticia", "análisis", "información"]
        }

# Instancia global
try:
    ai_analyzer = LegacyAIAnalyzer()
    logger.info("✅ Analizador Legacy IA inicializado correctamente")
except Exception as e:
    logger.error(f"❌ Error inicializando Legacy IA: {e}")
    
    # Fallback extremo
    class BackupAnalyzer:
        def analizar_noticia(self, titulo: str, contenido: str) -> Dict[str, Any]:
            return {
                "resumen": f"Resumen: {titulo}",
                "categoria": "General",
                "sentimiento": "neutral",
                "temas_principales": ["Contenido informativo"],
                "puntuacion_importancia": 5,
                "palabras_clave": ["noticia", "actualidad"]
            }
    ai_analyzer = BackupAnalyzer()