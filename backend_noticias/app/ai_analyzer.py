import os
import re
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class SmartNewsAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        logger.info("✅ Analizador Inteligente inicializado")

    def analizar_noticia(self, titulo: str, contenido: str) -> Dict[str, Any]:
        """
        Analiza noticias usando un enfoque híbrido: análisis local + IA cuando esté disponible
        """
        try:
            # Primero intentar con análisis local inteligente
            analisis = self._analisis_local_inteligente(titulo, contenido)
            
            # Si tenemos API key, intentar enriquecer con IA
            if self.api_key and contenido and len(contenido) > 100:
                try:
                    analisis_ia = self._enriquecer_con_ia(titulo, contenido)
                    # Combinar ambos análisis (preferir IA pero mantener fallbacks)
                    if analisis_ia and analisis_ia.get('resumen') != analisis['resumen']:
                        analisis.update(analisis_ia)
                        logger.info("✅ Análisis enriquecido con IA")
                except Exception as e:
                    logger.warning(f"⚠️ IA no disponible, usando análisis local: {e}")
            
            return analisis
            
        except Exception as e:
            logger.error(f"❌ Error en análisis: {e}")
            return self._analisis_basico(titulo)

    def _analisis_local_inteligente(self, titulo: str, contenido: str) -> Dict[str, Any]:
        """Análisis local inteligente usando procesamiento de texto"""
        # Categorización avanzada
        categoria = self._determinar_categoria(titulo, contenido)
        
        # Análisis de sentimiento básico
        sentimiento = self._analizar_sentimiento(titulo, contenido)
        
        # Generar resumen inteligente
        resumen = self._generar_resumen(titulo, contenido)
        
        # Extraer temas principales
        temas = self._extraer_temas(titulo, contenido)
        
        # Calcular importancia
        importancia = self._calcular_importancia(titulo, contenido, categoria)
        
        # Extraer palabras clave
        palabras_clave = self._extraer_palabras_clave(titulo, contenido)
        
        return {
            "resumen": resumen,
            "categoria": categoria,
            "sentimiento": sentimiento,
            "temas_principales": temas,
            "puntuacion_importancia": importancia,
            "palabras_clave": palabras_clave
        }

    def _determinar_categoria(self, titulo: str, contenido: str) -> str:
        """Determina la categoría basada en palabras clave y contexto"""
        categorias_keywords = {
            'Política': {
                'keywords': ['presidente', 'gobierno', 'congreso', 'ministro', 'elección', 'ley', 'política', 'estado', 'partido', 'votación'],
                'weight': 2
            },
            'Deportes': {
                'keywords': ['fútbol', 'partido', 'jugador', 'equipo', 'gol', 'liga', 'deporte', 'competencia', 'campeonato', 'atleta'],
                'weight': 2
            },
            'Economía': {
                'keywords': ['economía', 'dólar', 'mercado', 'empresa', 'precio', 'inflación', 'finanzas', 'negocio', 'comercio', 'bolsa'],
                'weight': 2
            },
            'Tecnología': {
                'keywords': ['tecnología', 'digital', 'internet', 'app', 'software', 'inteligencia artificial', 'redes', 'ciber', 'innovación', 'dispositivo'],
                'weight': 2
            },
            'Salud': {
                'keywords': ['salud', 'médico', 'hospital', 'enfermedad', 'virus', 'vacuna', 'paciente', 'medicina', 'tratamiento', 'cáncer'],
                'weight': 2
            },
            'Entretenimiento': {
                'keywords': ['película', 'música', 'actor', 'cantante', 'show', 'celebridad', 'serie', 'televisión', 'concierto', 'festival'],
                'weight': 1.5
            },
            'Ciencia': {
                'keywords': ['ciencia', 'investigación', 'estudio', 'descubrimiento', 'científico', 'espacio', 'tecnología', 'universidad', 'experimento'],
                'weight': 1.5
            },
            'Internacional': {
                'keywords': ['internacional', 'mundial', 'país', 'nación', 'global', 'ONU', 'relaciones', 'diplomacia', 'extranjero'],
                'weight': 1.5
            }
        }
        
        texto = f"{titulo} {contenido}".lower()
        scores = {}
        
        for categoria, data in categorias_keywords.items():
            score = 0
            for keyword in data['keywords']:
                if keyword in texto:
                    score += data['weight']
                    # Bonus si la palabra está en el título
                    if keyword in titulo.lower():
                        score += 1
            scores[categoria] = score
        
        # Encontrar la categoría con mayor puntuación
        mejor_categoria = max(scores.items(), key=lambda x: x[1])
        
        # Solo devolver la categoría si tiene un score significativo
        return mejor_categoria[0] if mejor_categoria[1] > 1 else 'General'

    def _analizar_sentimiento(self, titulo: str, contenido: str) -> str:
        """Análisis básico de sentimiento"""
        texto = f"{titulo} {contenido}".lower()
        
        palabras_positivas = ['éxito', 'ganar', 'victoria', 'mejor', 'bueno', 'positivo', 'avance', 'progreso', 'feliz', 'alegría']
        palabras_negativas = ['problema', 'muerte', 'accidente', 'tragedia', 'malo', 'negativo', 'conflicto', 'crisis', 'enfermedad', 'pérdida']
        
        positivos = sum(1 for palabra in palabras_positivas if palabra in texto)
        negativos = sum(1 for palabra in palabras_negativas if palabra in texto)
        
        if positivos > negativos + 2:
            return "positivo"
        elif negativos > positivos + 2:
            return "negativo"
        else:
            return "neutral"

    def _generar_resumen(self, titulo: str, contenido: str) -> str:
        """Genera un resumen inteligente del contenido"""
        if not contenido or len(contenido.strip()) < 50:
            return f"Noticia sobre: {titulo}"
        
        # Tomar las primeras 2 oraciones o 200 caracteres
        oraciones = re.split(r'[.!?]+', contenido)
        oraciones_validas = [o.strip() for o in oraciones if len(o.strip()) > 20]
        
        if oraciones_validas:
            resumen = '. '.join(oraciones_validas[:2]) + '.'
            if len(resumen) > 250:
                resumen = resumen[:247] + '...'
            return resumen
        else:
            return f"Resumen: {titulo}"

    def _extraer_temas(self, titulo: str, contenido: str) -> List[str]:
        """Extrae temas principales del contenido"""
        temas = []
        texto = f"{titulo} {contenido}".lower()
        
        temas_posibles = [
            'deportes', 'política', 'economía', 'tecnología', 'salud', 
            'educación', 'seguridad', 'medio ambiente', 'cultura', 'turismo'
        ]
        
        for tema in temas_posibles:
            if tema in texto:
                temas.append(tema.capitalize())
        
        return temas[:3] if temas else ['Actualidad']

    def _calcular_importancia(self, titulo: str, contenido: str, categoria: str) -> int:
        """Calcula la importancia de la noticia (1-10)"""
        importancia = 5  # Base
        
        # Factores que aumentan importancia
        factores = [
            (len(titulo) > 80, 1),  # Títulos largos suelen ser más importantes
            (len(contenido or '') > 500, 1),  # Contenido extenso
            (categoria in ['Política', 'Economía'], 1),  # Categorías importantes
            (any(palabra in titulo.lower() for palabra in ['urgente', 'importante', 'crisis', 'emergencia']), 2),
            (any(palabra in titulo.lower() for palabra in ['presidente', 'ministro', 'congreso']), 1),
        ]
        
        for condicion, puntos in factores:
            if condicion:
                importancia += puntos
        
        return min(10, max(1, importancia))

    def _extraer_palabras_clave(self, titulo: str, contenido: str) -> List[str]:
        """Extrae palabras clave relevantes"""
        palabras_excluidas = {
            'de', 'la', 'el', 'en', 'y', 'a', 'que', 'se', 'con', 'por', 'para', 
            'los', 'las', 'un', 'una', 'unos', 'unas', 'del', 'al', 'lo', 'su', 'sus'
        }
        
        texto = f"{titulo} {contenido}"
        palabras = re.findall(r'\b[a-zA-Záéíóúñ]{4,}\b', texto.lower())
        
        # Contar frecuencia y filtrar
        from collections import Counter
        contador = Counter(palabras)
        
        palabras_clave = [
            palabra for palabra, count in contador.most_common(10)
            if palabra not in palabras_excluidas and count > 1
        ]
        
        return palabras_clave[:5] if palabras_clave else ['noticia', 'información']

    def _enriquecer_con_ia(self, titulo: str, contenido: str) -> Dict[str, Any]:
        """Intenta enriquecer el análisis con IA (opcional)"""
        # Por ahora devolvemos un análisis vacío para IA
        # Esto se puede expandir más tarde con otras APIs
        return {}

    def _analisis_basico(self, titulo: str) -> Dict[str, Any]:
        """Análisis básico de respaldo"""
        return {
            "resumen": f"Análisis de: {titulo}",
            "categoria": "General",
            "sentimiento": "neutral",
            "temas_principales": ["Información general"],
            "puntuacion_importancia": 5,
            "palabras_clave": ["noticia", "análisis", "actualidad"]
        }

# Instancia global
ai_analyzer = SmartNewsAnalyzer()