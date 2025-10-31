import re
from typing import Dict, List, Tuple

class ClasificadorNoticias:
    def __init__(self):
        self.palabras_clave: Dict[str, List[str]] = {
            'Política': [
                'presidente', 'gobierno', 'congreso', 'ministro', 'político', 'elecciones',
                'partido', 'ley', 'reforma', 'estado', 'ministerio', 'parlamento', 'votación',
                'democracia', 'corrupción', 'protesta', 'manifestación', 'poder', 'estado'
            ],
            'Economía': [
                'economía', 'dólar', 'bolsa', 'mercado', 'finanzas', 'empresa', 'negocio',
                'inversión', 'impuestos', 'pbi', 'crecimiento', 'recesión', 'inflación',
                'banco', 'financiero', 'comercio', 'exportación', 'importación', 'empleo'
            ],
            'Deportes': [
                'fútbol', 'deporte', 'partido', 'jugador', 'equipo', 'campeonato', 'liga',
                'olímpico', 'atleta', 'competencia', 'gol', 'entrenador', 'estadio',
                'tenis', 'básquet', 'vóley', 'natación', 'atletismo', 'motor'
            ],
            'Tecnología': [
                'tecnología', 'digital', 'internet', 'software', 'hardware', 'aplicación',
                'smartphone', 'computadora', 'inteligencia artificial', 'ia', 'robot',
                'innovación', 'startup', 'redes sociales', 'facebook', 'twitter', 'instagram',
                'tiktok', 'youtube', 'streaming', 'cloud', 'nube', 'cripto', 'bitcoin'
            ],
            'Salud': [
                'salud', 'médico', 'hospital', 'enfermedad', 'virus', 'vacuna', 'covid',
                'paciente', 'tratamiento', 'medicina', 'farmacia', 'epidemia', 'pandemia',
                'bienestar', 'nutrición', 'ejercicio', 'mental', 'psicológico', 'terapia'
            ],
            'Cultura': [
                'cultura', 'arte', 'música', 'cine', 'teatro', 'literatura', 'libro',
                'película', 'serie', 'festival', 'exposición', 'museo', 'artista',
                'escritor', 'actor', 'director', 'banda', 'concierto', 'ópera', 'danza'
            ],
            'Internacional': [
                'internacional', 'mundial', 'onu', 'ue', 'eeuu', 'estados unidos', 'china',
                'europa', 'asia', 'ámérica', 'áfrica', 'tratado', 'acuerdo', 'diplomacia',
                'embajada', 'consulado', 'migración', 'refugiado', 'global', 'geopolítica'
            ]
        }
    
    def clasificar_noticia(self, titulo: str, contenido: str, url: str) -> str:
        """
        Clasifica una noticia basándose en palabras clave en título, contenido y URL
        """
        texto_completo = f"{titulo.lower()} {contenido.lower()} {url.lower()}"
        
        puntuaciones = {categoria: 0 for categoria in self.palabras_clave.keys()}
        
        # Contar ocurrencias de palabras clave
        for categoria, palabras in self.palabras_clave.items():
            for palabra in palabras:
                if palabra.lower() in texto_completo:
                    puntuaciones[categoria] += 1
        
        # Buscar patrones específicos en URL
        patrones_url = {
            'Política': ['politica', 'gobierno', 'congreso'],
            'Economía': ['economia', 'finanzas', 'negocios'],
            'Deportes': ['deportes', 'futbol', 'deporte'],
            'Tecnología': ['tecnologia', 'ciencia', 'digital'],
            'Salud': ['salud', 'medicina', 'bienestar'],
            'Cultura': ['cultura', 'entretenimiento', 'espectaculos'],
            'Internacional': ['internacional', 'mundo', 'exterior']
        }
        
        for categoria, patrones in patrones_url.items():
            for patron in patrones:
                if patron in url.lower():
                    puntuaciones[categoria] += 2
        
        # Encontrar categoría con mayor puntuación
        categoria_max = max(puntuaciones.items(), key=lambda x: x[1])
        
        # Si no hay coincidencias significativas, usar "General"
        if categoria_max[1] == 0:
            return "General"
        
        return categoria_max[0]

# Instancia global del clasificador
clasificador = ClasificadorNoticias()