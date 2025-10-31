// Mantén tus interfaces como están, pero actualiza los imports en otros archivos
export interface Noticia {
  id: number;
  titulo: string;
  enlace: string;
  fecha: string;
  categoria: string;
  contenido: string;
  imagen_url: string | null;
  fuente: string;
  fecha_creacion: string;
}

export interface Estadisticas {
  total_noticias: number;
  categorias: { [key: string]: number };
  fuentes: { [key: string]: number };
  ultima_actualizacion: string | null;
}

export interface ScrapingResponse {
  mensaje: string;
  noticias_obtenidas: number;
  noticias_guardadas: number;
  duplicados: number;
  errores: number;
}

export interface FuentesResponse {
  fuentes: string[];
  urls: { [key: string]: string };
}

export interface CategoriasResponse {
  categorias: string[];
}