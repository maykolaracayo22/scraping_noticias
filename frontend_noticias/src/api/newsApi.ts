import type { 
  Noticia, 
  Estadisticas, 
  ScrapingResponse, 
  FuentesResponse, 
  CategoriasResponse,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  PlanInfo,
  ReporteConNoticia,
  SolicitudUpgrade, // ← Agregar este import
  SolicitudUpgradeCreate, // ← Agregar este import
  SolicitudUpgradeUpdate, // ← Agregar este import
  MetricasAvanzadas,
  AnalisisIAResponse
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Variable para almacenar el token
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
};

// Headers comunes con autenticación
const getAuthHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

export const newsApi = {
  
  // ==================== MÉTRICAS AVANZADAS ====================
  getMetricasAvanzadas: async (): Promise<MetricasAvanzadas> => {
    const response = await fetch(`${API_BASE_URL}/admin/metricas-avanzadas`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo métricas avanzadas');
    }

    return response.json();
  },
  // ==================== AUTENTICACIÓN ====================
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Credenciales incorrectas');
    }

    const data: AuthResponse = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error en el registro');
    }

    return response.json();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/usuario/actual`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('No autenticado');
    }

    return response.json();
  },

  getPlanInfo: async (): Promise<PlanInfo> => {
    const response = await fetch(`${API_BASE_URL}/usuario/plan-info`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo información del plan');
    }

    return response.json();
  },
  // Agrega estas funciones si no las tienes
  getReportes: async (estado?: string): Promise<ReporteConNoticia[]> => {
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);
    
    const response = await fetch(`${API_BASE_URL}/reportes?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo reportes');
    }

    return response.json();
  },

  actualizarReporte: async (reporteId: number, datos: any): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reportes/${reporteId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error('Error actualizando reporte');
    }
  },

  // ==================== NOTICIAS (protegidas) ====================
  getNoticias: async (skip: number = 0, limit: number = 100, fuente?: string): Promise<Noticia[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(fuente && { fuente })
    });

    const response = await fetch(`${API_BASE_URL}/noticias?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo noticias');
    }

    return response.json();
  },

  getNoticia: async (id: number): Promise<Noticia> => {
    const response = await fetch(`${API_BASE_URL}/noticias/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Noticia no encontrada');
    }

    return response.json();
  },

  getNoticiasPorCategoria: async (categoria: string, skip: number = 0, limit: number = 100): Promise<Noticia[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/noticias/categoria/${categoria}?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo noticias por categoría');
    }

    return response.json();
  },

  buscarNoticias: async (query: string, skip: number = 0, limit: number = 100): Promise<Noticia[]> => {
    const params = new URLSearchParams({
      q: query,
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/buscar?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error buscando noticias');
    }

    return response.json();
  },

  

  // ==================== FUNCIONALIDADES BÁSICAS (siempre disponibles) ====================
  getEstadisticas: async (): Promise<Estadisticas> => {
    const response = await fetch(`${API_BASE_URL}/estadisticas`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo estadísticas');
    }

    return response.json();
  },

  ejecutarScraping: async (): Promise<ScrapingResponse> => {
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error ejecutando scraping');
    }

    return response.json();
  },

  getFuentes: async (): Promise<FuentesResponse> => {
    const response = await fetch(`${API_BASE_URL}/fuentes`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo fuentes');
    }

    return response.json();
  },

  getCategorias: async (): Promise<CategoriasResponse> => {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo categorías');
    }

    return response.json();
  },

  // ==================== OPCIONES DE EXPORTACIÓN ====================
  getOpcionesExportacion: async (): Promise<{ categorias: string[]; fuentes: string[] }> => {
    try {
      const [categoriasRes, fuentesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/categorias`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/fuentes`, {
          headers: getAuthHeaders(),
        })
      ]);

      if (!categoriasRes.ok || !fuentesRes.ok) {
        throw new Error('Error obteniendo opciones de exportación');
      }

      const categoriasData: CategoriasResponse = await categoriasRes.json();
      const fuentesData: FuentesResponse = await fuentesRes.json();
      
      return {
        categorias: categoriasData.categorias,
        fuentes: fuentesData.fuentes.map((fuente: string) => 
          fuente.replace('_', ' ')
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
            .join(' ')
        )
      };
    } catch (error) {
      console.error('Error obteniendo opciones de exportación:', error);
      return { categorias: [], fuentes: [] };
    }
  },


  reportarNoticia: async (noticiaId: number, motivo: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reportes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        noticia_id: noticiaId,
        motivo: motivo
      }),
    });

    if (!response.ok) {
      throw new Error('Error al reportar la noticia');
    }
  },

  // ==================== FUNCIONALIDADES PLUS (requieren plan plus) ====================
  ejecutarScrapingAvanzado: async (): Promise<ScrapingResponse> => {
    const response = await fetch(`${API_BASE_URL}/scrape-avanzado`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('PLUS_REQUIRED');
      }
      throw new Error('Error ejecutando scraping avanzado');
    }

    return response.json();
  },
  // Agrega estas funciones al objeto newsApi en tu newsApi.ts

  // ==================== SOLICITUDES DE UPGRADE ====================
  crearSolicitudUpgrade: async (solicitud: SolicitudUpgradeCreate): Promise<SolicitudUpgrade> => {
    const response = await fetch(`${API_BASE_URL}/solicitudes-upgrade`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(solicitud),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error creando solicitud de upgrade');
    }

    return response.json();
  },

  obtenerMisSolicitudes: async (): Promise<SolicitudUpgrade[]> => {
    const response = await fetch(`${API_BASE_URL}/solicitudes-upgrade/mis-solicitudes`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo solicitudes');
    }

    return response.json();
  },

  // ==================== ADMIN - SOLICITUDES DE UPGRADE ====================
  obtenerSolicitudesUpgrade: async (estado?: string): Promise<SolicitudUpgrade[]> => {
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);
    
    const response = await fetch(`${API_BASE_URL}/admin/solicitudes-upgrade?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo solicitudes de upgrade');
    }

    return response.json();
  },

  actualizarSolicitudUpgrade: async (solicitudId: number, datos: SolicitudUpgradeUpdate): Promise<SolicitudUpgrade> => {
    const response = await fetch(`${API_BASE_URL}/admin/solicitudes-upgrade/${solicitudId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error('Error actualizando solicitud');
    }

    return response.json();
  },
  // ==================== ANÁLISIS IA ====================
  analizarNoticiaIA: async (noticiaId: number): Promise<AnalisisIAResponse> => {
    const response = await fetch(`${API_BASE_URL}/analizar-noticia-ia`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ noticia_id: noticiaId }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('PLUS_REQUIRED');
      }
      throw new Error('Error analizando noticia con IA');
    }

    return response.json();
  },

  obtenerAnalisisIANoticia: async (noticiaId: number): Promise<AnalisisIAResponse> => {
    const response = await fetch(`${API_BASE_URL}/noticias/${noticiaId}/analisis-ia`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('PLUS_REQUIRED');
      }
      throw new Error('Error obteniendo análisis IA');
    }

    return response.json();
  },

};

