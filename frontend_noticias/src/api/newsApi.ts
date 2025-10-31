import axios from 'axios';
import type { Noticia, Estadisticas, ScrapingResponse, FuentesResponse, CategoriasResponse } from '../types';

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const newsApi = {
  // Obtener noticias con paginación y filtros
  getNoticias: async (skip: number = 0, limit: number = 10, fuente?: string): Promise<Noticia[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(fuente && { fuente })
    });
    const response = await api.get(`/noticias?${params}`);
    return response.data;
  },

  // Obtener noticia por ID
  getNoticia: async (id: number): Promise<Noticia> => {
    const response = await api.get(`/noticias/${id}`);
    return response.data;
  },

  // Obtener noticias por categoría
  getNoticiasPorCategoria: async (categoria: string, skip: number = 0, limit: number = 10): Promise<Noticia[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });
    const response = await api.get(`/noticias/categoria/${categoria}?${params}`);
    return response.data;
  },

  // Buscar noticias
  buscarNoticias: async (query: string, skip: number = 0, limit: number = 10): Promise<Noticia[]> => {
    const params = new URLSearchParams({
      q: query,
      skip: skip.toString(),
      limit: limit.toString()
    });
    const response = await api.get(`/buscar?${params}`);
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async (): Promise<Estadisticas> => {
    const response = await api.get('/estadisticas');
    return response.data;
  },

  // Obtener fuentes
  getFuentes: async (): Promise<FuentesResponse> => {
    const response = await api.get('/fuentes');
    return response.data;
  },

  // Obtener categorías
  getCategorias: async (): Promise<CategoriasResponse> => {
    const response = await api.get('/categorias');
    return response.data;
  },

  // Ejecutar scraping
  ejecutarScraping: async (): Promise<ScrapingResponse> => {
    const response = await api.post('/scrape');
    return response.data;
  },
};