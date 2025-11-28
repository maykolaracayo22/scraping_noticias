// Tipos para noticias y contenido
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

// Tipos para el sistema de reportes
export interface Reporte {
  id: number;
  noticia_id: number;
  motivo: string;
  descripcion?: string;
  fecha_reporte: string;
  estado: 'pendiente' | 'revisado' | 'resuelto' | 'descartado';
  notas_admin?: string;
}

export interface ReporteCreate {
  noticia_id: number;
  motivo: string;
  descripcion?: string;
}

export interface ReporteUpdate {
  estado: 'pendiente' | 'revisado' | 'resuelto' | 'descartado';
  notas_admin?: string;
}

export interface ReporteConNoticia extends Reporte {
  titulo_noticia: string;
  fuente_noticia: string;
  enlace_noticia: string;
}

export interface EstadisticasReportes {
  total_reportes: number;
  reportes_pendientes: number;
  reportes_revisados: number;
  reportes_resueltos: number;
  reportes_por_motivo: { [key: string]: number };
}

// Tipos para el sistema de autenticación y usuarios
export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'user' | 'admin';
  plan: 'free' | 'plus'; // ← AGREGAR esta propiedad
  fecha_creacion?: string;
  activo?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
}

export interface AuthResponse {
  access_token: string; // ← CORREGIR nombre
  token_type: string;
  usuario: User;
}

export interface TokenData {
  email?: string;
  rol?: string;
}

// Tipos para el sistema de suscripciones/planes
export interface PlanInfo { // ← AGREGAR esta interfaz
  plan_actual: string;
  puede_exportar: boolean;
  puede_scraping_avanzado: boolean;
}

export interface Plan {
  id: string;
  nombre: string;
  precio: number;
  moneda: string;
  intervalo: 'monthly' | 'yearly';
  caracteristicas: string[];
  popular?: boolean;
  tipo: 'free' | 'premium' | 'enterprise';
}

export interface Suscripcion {
  id: number;
  usuario_id: number;
  plan_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'active' | 'canceled' | 'expired';
  precio_pagado: number;
}

export interface Pago {
  id: number;
  suscripcion_id: number;
  monto: number;
  moneda: string;
  metodo_pago: string;
  estado: 'pending' | 'completed' | 'failed';
  fecha_pago: string;
}

// Tipos para el dashboard de administración
export interface AdminStats {
  total_usuarios: number;
  usuarios_activos: number;
  total_noticias: number;
  noticias_hoy: number;
  total_reportes: number;
  reportes_pendientes: number;
  ingresos_mensuales: number;
}

export interface UserStats {
  noticias_vistas: number;
  reportes_realizados: number;
  exportaciones_realizadas: number;
  plan_actual: string;
  fecha_vencimiento?: string;
}
export interface ReporteConNoticia extends Reporte {
  titulo_noticia: string;
  fuente_noticia: string;
  enlace_noticia: string;
}
// Tipos para el sistema de upgrades
export interface SolicitudUpgrade {
  id: number;
  usuario_id: number;
  plan_solicitado: string;
  codigo_yape: string;
  monto: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_solicitud: string;
  fecha_revision?: string;
  notas_admin?: string;
  usuario_nombre: string;
  usuario_email: string;
}

export interface SolicitudUpgradeCreate {
  plan_solicitado: string;
  codigo_yape: string;
}

export interface SolicitudUpgradeUpdate {
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  notas_admin?: string;
}

// Agregar en types/index.ts
export interface ExportOptions {
  tipoExport: 'ultimas_20' | 'por_categoria' | 'por_fuente' | 'personalizado' | 'todas';
  categoria?: string;
  fuente?: string;
  limite?: number;
  buscarTexto?: string;
}

// Agregar en types/index.ts
export interface MetricasAvanzadas {
  palabras_mas_buscadas: Array<{ palabra: string; cantidad: number }>;
  palabras_mas_frecuentes: Array<{ palabra: string; cantidad: number }>;
  noticias_mas_vistas: Array<{ noticia_id: number; titulo: string; vistas: number }>;
  categorias_mas_populares: Array<{ categoria: string; porcentaje: number }>;
  tendencias_temporales: {
    ultima_semana: Array<{ fecha: string; cantidad: number }>;
    ultimo_mes: Array<{ fecha: string; cantidad: number }>;
  };
  actividad_usuarios: {
    total_usuarios: number;
    usuarios_activos: number;
    nuevos_usuarios: number;
    usuarios_plus: number;
  };
}

export interface EstadisticasCompletas extends Estadisticas {
  metricas_avanzadas?: MetricasAvanzadas;
}

// Agregar en types/index.ts

export interface AnalisisIA {
  id: number;
  noticia_id: number;
  resumen: string;
  categoria: string;
  sentimiento: string;
  temas_principales: string[];
  puntuacion_importancia: number;
  palabras_clave: string[];
  fecha_analisis: string;
}

export interface AnalisisIAResponse {
  analisis: AnalisisIA;
  noticia: Noticia;
}

export interface AnalisisIARequest {
  noticia_id: number;
}