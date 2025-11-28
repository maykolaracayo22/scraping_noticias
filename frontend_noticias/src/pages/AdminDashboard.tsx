import React, { useState, useEffect } from 'react';
import type { Estadisticas, User, ReporteConNoticia, SolicitudUpgrade, MetricasAvanzadas } from '../types';
import { newsApi } from '../api/newsApi';
import StatsDashboard from '../components/StatsDashboard';
import ScrapeButton from '../components/ScrapeButton';
import LoadingSpinner from '../components/LoadingSpinner';
import UserAccountFab from '../components/UserAccountFab';
import WordCloud from '../components/WordCloud';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [metricasAvanzadas, setMetricasAvanzadas] = useState<MetricasAvanzadas | null>(null);
  const [reportes, setReportes] = useState<ReporteConNoticia[]>([]);
  const [solicitudesUpgrade, setSolicitudesUpgrade] = useState<SolicitudUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reportes' | 'upgrades' | 'analiticas'>('dashboard');

  // Iconos SVG profesionales
  const AdminIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const DashboardIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const ReportsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const UpgradesIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  // NUEVOS ICONOS AGREGADOS
  const AnalyticsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const TrendingIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );

  const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const MetricsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const ActionsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const PrivilegesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const ProcessIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const ApproveIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const RejectIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const ReviewIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const ResolveIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ViewIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [estadisticasData, reportesData, solicitudesData] = await Promise.all([
        newsApi.getEstadisticas(),
        newsApi.getReportes(),
        newsApi.obtenerSolicitudesUpgrade('pendiente')
      ]);
      setEstadisticas(estadisticasData);
      setReportes(reportesData);
      setSolicitudesUpgrade(solicitudesData);
      
      // Intentar cargar métricas avanzadas, pero si falla, continuar sin ellas
      try {
        const metricasData = await newsApi.getMetricasAvanzadas();
        // Asegurarnos de que metricasData tenga la estructura correcta INCLUYENDO palabras_mas_frecuentes
        setMetricasAvanzadas({
          palabras_mas_buscadas: metricasData?.palabras_mas_buscadas || [],
          palabras_mas_frecuentes: metricasData?.palabras_mas_frecuentes || [], // ✅ AGREGAR ESTA LÍNEA
          noticias_mas_vistas: metricasData?.noticias_mas_vistas || [],
          categorias_mas_populares: metricasData?.categorias_mas_populares || [],
          tendencias_temporales: metricasData?.tendencias_temporales || { ultima_semana: [], ultimo_mes: [] },
          actividad_usuarios: metricasData?.actividad_usuarios || {
            total_usuarios: 0,
            usuarios_activos: 0,
            nuevos_usuarios: 0,
            usuarios_plus: 0
          }
        });
      } catch (metricasError) {
        console.warn('No se pudieron cargar las métricas avanzadas:', metricasError);
        // Establecer estructura vacía para métricas avanzadas INCLUYENDO palabras_mas_frecuentes
        setMetricasAvanzadas({
          palabras_mas_buscadas: [],
          palabras_mas_frecuentes: [], // ✅ AGREGAR ESTA LÍNEA
          noticias_mas_vistas: [],
          categorias_mas_populares: [],
          tendencias_temporales: { ultima_semana: [], ultimo_mes: [] },
          actividad_usuarios: {
            total_usuarios: 0,
            usuarios_activos: 0,
            nuevos_usuarios: 0,
            usuarios_plus: 0
          }
        });
      }
    } catch (error) {
      console.error('Error cargando datos principales:', error);
      alert('Error cargando datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };
  const handleScrapingComplete = () => {
    cargarDatos();
  };

  const handleActualizarEstadoReporte = async (reporteId: number, nuevoEstado: string) => {
    try {
      await newsApi.actualizarReporte(reporteId, { estado: nuevoEstado });
      cargarDatos();
      alert('Estado del reporte actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando reporte:', error);
      alert('Error al actualizar el reporte');
    }
  };

  const handleProcesarSolicitudUpgrade = async (solicitudId: number, accion: 'aprobado' | 'rechazado') => {
    try {
      await newsApi.actualizarSolicitudUpgrade(solicitudId, {
        estado: accion,
        notas_admin: accion === 'aprobado' ? 'Solicitud aprobada por administrador' : 'Solicitud rechazada por administrador'
      });
      
      alert(`Solicitud ${accion === 'aprobado' ? 'aprobada' : 'rechazada'} correctamente`);
      cargarDatos();
    } catch (error) {
      console.error('Error procesando solicitud:', error);
      alert('Error al procesar la solicitud');
    }
  };

  // NUEVA FUNCIÓN AGREGADA - Renderizar gráficos de barras
  const renderBarChart = (data: Array<{ label: string; value: number }>, color: string) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm text-gray-300 w-32 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full rounded-full ${color}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-white w-12 text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <LoadingSpinner />
        <UserAccountFab user={user} />
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Error cargando datos</h2>
          <button
            onClick={cargarDatos}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 p-6 bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <AdminIcon />
              </div>
              <h1 className="text-4xl font-bold text-white">Panel de Administración</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Bienvenido, <span className="text-blue-300 font-semibold">{user.nombre}</span> - Gestiona el sistema completo
            </p>
          </div>
          
          <ScrapeButton onScrapingComplete={handleScrapingComplete} />
        </div>

        {/* Tabs de Navegación - ACTUALIZADA CON NUEVA TAB */}
        <div className="mb-8 bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <DashboardIcon />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analiticas')}
              className={`flex items-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'analiticas'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <AnalyticsIcon />
              Analíticas
            </button>
            <button
              onClick={() => setActiveTab('reportes')}
              className={`flex items-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'reportes'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <ReportsIcon />
              Reportes 
              <span className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full">
                {reportes.filter(r => r.estado === 'pendiente').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upgrades')}
              className={`flex items-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'upgrades'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <UpgradesIcon />
              Upgrades 
              <span className="bg-yellow-500/80 text-white text-xs px-2 py-1 rounded-full">
                {solicitudesUpgrade.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Contenido de las Tabs */}
        {activeTab === 'dashboard' && (
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <DashboardIcon />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Estadísticas del Sistema</h2>
                <p className="text-gray-300 text-lg">
                  Resumen completo de las noticias almacenadas en el sistema
                </p>
              </div>
            </div>
            <StatsDashboard estadisticas={estadisticas} />
          </div>
        )}

        {/* NUEVA TAB AGREGADA - ANALÍTICAS */}
        {activeTab === 'analiticas' && (
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <AnalyticsIcon />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Analíticas Avanzadas</h2>
                <p className="text-gray-300 text-lg">
                  Métricas detalladas del comportamiento de usuarios y contenido
                </p>
              </div>
            </div>

            {!metricasAvanzadas ? (
              <div className="text-center py-12 bg-gray-700/30 rounded-2xl border border-gray-600/50">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                    <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Métricas no disponibles</h3>
                  <p className="text-gray-300 mb-4">
                    Las métricas avanzadas no están disponibles en este momento.
                  </p>
                  <button
                    onClick={cargarDatos}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              // ... el resto del contenido de analíticas que ya tienes ...
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Tu contenido existente de analíticas aquí */}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analiticas' && (
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <AnalyticsIcon />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Analíticas Avanzadas</h2>
                <p className="text-gray-300 text-lg">
                  Métricas detalladas del comportamiento de usuarios y contenido
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 bg-gray-700/30 rounded-2xl border border-gray-600/50">
                <LoadingSpinner />
                <p className="text-gray-300 mt-4">Cargando métricas avanzadas...</p>
              </div>
            ) : !metricasAvanzadas ? (
              <div className="text-center py-12 bg-gray-700/30 rounded-2xl border border-gray-600/50">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No se pudieron cargar las métricas</h3>
                  <p className="text-gray-300 mb-4">
                    Las métricas avanzadas no están disponibles en este momento.
                  </p>
                  <button
                    onClick={cargarDatos}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Grid Principal de Métricas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Palabras Más Frecuentes en Noticias - NUBE DE PALABRAS */}
                    <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingIcon />
                        <h3 className="font-semibold text-white text-lg">Palabras Más Frecuentes</h3>
                      </div>
                      {metricasAvanzadas.palabras_mas_frecuentes && metricasAvanzadas.palabras_mas_frecuentes.length > 0 ? (
                        <div className="relative">
                          <WordCloud words={metricasAvanzadas.palabras_mas_frecuentes} maxWords={25} />
                          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                            <span className="text-xs text-gray-300">
                              {metricasAvanzadas.palabras_mas_frecuentes.length} palabras
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No hay datos de palabras frecuentes</p>
                          <p className="text-gray-500 text-sm mt-2">Analizando contenido de noticias...</p>
                        </div>
                      )}
                    </div>
                  
                  {/* Palabras Más Buscadas */}
                  <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <SearchIcon />
                      <h3 className="font-semibold text-white text-lg">Palabras Más Buscadas</h3>
                    </div>
                    {metricasAvanzadas.palabras_mas_buscadas && metricasAvanzadas.palabras_mas_buscadas.length > 0 ? (
                      <div className="space-y-3">
                        {metricasAvanzadas.palabras_mas_buscadas.slice(0, 8).map((palabra, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg border border-gray-500/30">
                            <div className="flex items-center gap-3">
                              <span className="text-blue-400 font-bold text-sm">#{index + 1}</span>
                              <span className="text-white font-medium">{palabra.palabra}</span>
                            </div>
                            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                              {palabra.cantidad} búsq.
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-gray-400">No hay datos de búsquedas</p>
                        <p className="text-gray-500 text-sm mt-1">Las búsquedas aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                  {/* Palabras Más Frecuentes en Noticias */}
                  <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingIcon />
                      <h3 className="font-semibold text-white text-lg">Palabras Más Frecuentes en Noticias</h3>
                    </div>
                    {metricasAvanzadas.palabras_mas_frecuentes && metricasAvanzadas.palabras_mas_frecuentes.length > 0 ? (
                      renderBarChart(
                        metricasAvanzadas.palabras_mas_frecuentes
                          .slice(0, 10) // 👈 LÍMITE DE 10 PALABRAS
                          .map(p => ({ label: p.palabra, value: p.cantidad })),
                        'bg-gradient-to-r from-purple-500 to-pink-500'
                      )
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No hay datos de palabras frecuentes</p>
                        <p className="text-gray-500 text-sm mt-2">Analizando contenido de noticias...</p>
                      </div>
                    )}
                  </div>

                  {/* Categorías Más Populares */}
                  <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingIcon />
                      <h3 className="font-semibold text-white text-lg">Categorías Más Populares</h3>
                    </div>
                    {metricasAvanzadas.categorias_mas_populares && metricasAvanzadas.categorias_mas_populares.length > 0 ? (
                      <div className="space-y-4">
                        {metricasAvanzadas.categorias_mas_populares.slice(0, 6).map((categoria, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-white">{categoria.categoria}</span>
                              <span className="text-sm font-bold text-green-400">{categoria.porcentaje}%</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${categoria.porcentaje}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-400">No hay datos de categorías</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segunda Fila de Métricas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  
                  {/* Actividad de Usuarios */}
                  <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <UsersIcon />
                      <h3 className="font-semibold text-white text-lg">Actividad de Usuarios</h3>
                    </div>
                    {metricasAvanzadas.actividad_usuarios ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                          <div className="text-2xl font-bold text-blue-300">{metricasAvanzadas.actividad_usuarios.total_usuarios}</div>
                          <div className="text-sm text-blue-200 mt-1">Total Usuarios</div>
                        </div>
                        <div className="text-center p-4 bg-green-500/20 rounded-xl border border-green-500/30 hover:bg-green-500/30 transition-colors">
                          <div className="text-2xl font-bold text-green-300">{metricasAvanzadas.actividad_usuarios.usuarios_plus}</div>
                          <div className="text-sm text-green-200 mt-1">Usuarios Plus</div>
                        </div>
                        <div className="text-center p-4 bg-purple-500/20 rounded-xl border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                          <div className="text-2xl font-bold text-purple-300">{metricasAvanzadas.actividad_usuarios.usuarios_activos}</div>
                          <div className="text-sm text-purple-200 mt-1">Activos</div>
                        </div>
                        <div className="text-center p-4 bg-cyan-500/20 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
                          <div className="text-2xl font-bold text-cyan-300">{metricasAvanzadas.actividad_usuarios.nuevos_usuarios}</div>
                          <div className="text-sm text-cyan-200 mt-1">Nuevos</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-gray-400">No hay datos de usuarios</p>
                      </div>
                    )}
                  </div>

                  {/* Noticias Más Populares */}
                  <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ChartIcon />
                      <h3 className="font-semibold text-white text-lg">Noticias Más Populares</h3>
                    </div>
                    {metricasAvanzadas.noticias_mas_vistas && metricasAvanzadas.noticias_mas_vistas.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {metricasAvanzadas.noticias_mas_vistas.slice(0, 5).map((noticia, index) => (
                          <div key={noticia.noticia_id} className="flex items-start justify-between p-3 bg-gray-600/30 rounded-lg border border-gray-500/30 hover:bg-gray-600/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-400 font-bold text-sm">#{index + 1}</span>
                                <div className="text-sm font-semibold text-white truncate">
                                  {noticia.titulo}
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">ID: {noticia.noticia_id}</div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-yellow-400 text-sm font-bold">{noticia.vistas}</span>
                              <span className="text-gray-400 text-xs">vistas</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v12m0-12a2 2 0 012-2h2a2 2 0 012 2m-6 9v2m0-2a2 2 0 002 2h2a2 2 0 002-2m0 0V9" />
                        </svg>
                        <p className="text-gray-400">No hay datos de noticias</p>
                        <p className="text-gray-500 text-sm mt-1">Las noticias populares aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tendencias Temporales */}
                <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingIcon />
                    <h3 className="font-semibold text-white text-lg">Tendencias Temporales</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Última Semana */}
                    <div>
                      <h4 className="text-blue-300 font-semibold mb-4 text-lg">📊 Última Semana</h4>
                      {metricasAvanzadas.tendencias_temporales && metricasAvanzadas.tendencias_temporales.ultima_semana && metricasAvanzadas.tendencias_temporales.ultima_semana.length > 0 ? (
                        <div className="space-y-3">
                          {metricasAvanzadas.tendencias_temporales.ultima_semana.map((dia, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-600/30 rounded-lg border border-gray-500/30">
                              <span className="text-sm text-gray-300">{new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{dia.cantidad}</span>
                                <span className="text-gray-400 text-xs">noticias</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-600/20 rounded-lg border border-gray-500/30">
                          <p className="text-gray-400">No hay datos de la semana</p>
                        </div>
                      )}
                    </div>

                    {/* Último Mes */}
                    <div>
                      <h4 className="text-green-300 font-semibold mb-4 text-lg">📈 Último Mes</h4>
                      {metricasAvanzadas.tendencias_temporales && metricasAvanzadas.tendencias_temporales.ultimo_mes && metricasAvanzadas.tendencias_temporales.ultimo_mes.length > 0 ? (
                        <div className="space-y-3">
                          {metricasAvanzadas.tendencias_temporales.ultimo_mes.map((semana, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-600/30 rounded-lg border border-gray-500/30">
                              <span className="text-sm text-gray-300">{semana.fecha}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{semana.cantidad}</span>
                                <span className="text-gray-400 text-xs">noticias</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-600/20 rounded-lg border border-gray-500/30">
                          <p className="text-gray-400">No hay datos del mes</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resumen de Métricas */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-semibold text-purple-300 text-lg">Resumen de Métricas</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {metricasAvanzadas.palabras_mas_buscadas?.length || 0}
                      </div>
                      <div className="text-sm text-purple-200">Palabras Top</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {metricasAvanzadas.noticias_mas_vistas?.length || 0}
                      </div>
                      <div className="text-sm text-purple-200">Noticias Populares</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {metricasAvanzadas.categorias_mas_populares?.length || 0}
                      </div>
                      <div className="text-sm text-purple-200">Categorías</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {metricasAvanzadas.actividad_usuarios?.total_usuarios || 0}
                      </div>
                      <div className="text-sm text-purple-200">Total Usuarios</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

                {activeTab === 'reportes' && (
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ReportsIcon />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Gestión de Reportes</h2>
                <p className="text-gray-300 text-lg">
                  Revisa y gestiona los reportes de noticias realizados por los usuarios
                </p>
              </div>
            </div>

            {reportes.length === 0 ? (
              <div className="text-center py-12 bg-gray-700/30 rounded-2xl border border-gray-600/50">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                    <CheckIcon />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No hay reportes pendientes</h3>
                  <p className="text-gray-300">
                    No hay reportes pendientes de revisión en este momento.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-600/50">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Noticia
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Motivo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/30 divide-y divide-gray-600/50">
                    {reportes.map((reporte) => (
                      <tr key={reporte.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-white">
                            {reporte.titulo_noticia}
                          </div>
                          <div className="text-sm text-gray-400">
                            {reporte.fuente_noticia}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white max-w-xs">
                            {reporte.motivo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(reporte.fecha_reporte).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            reporte.estado === 'pendiente' 
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : reporte.estado === 'revisado'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}>
                            {reporte.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {reporte.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => handleActualizarEstadoReporte(reporte.id, 'revisado')}
                                  className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                                >
                                  <ReviewIcon />
                                  Revisar
                                </button>
                                <button
                                  onClick={() => handleActualizarEstadoReporte(reporte.id, 'resuelto')}
                                  className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                                >
                                  <ResolveIcon />
                                  Resolver
                                </button>
                              </>
                            )}
                            <a 
                              href={reporte.enlace_noticia} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                            >
                              <ViewIcon />
                              Ver Noticia
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Información adicional sobre reportes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MetricsIcon />
                  <h4 className="font-semibold text-purple-300 text-lg">Estadísticas</h4>
                </div>
                <ul className="text-purple-200 space-y-2">
                  <li className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold text-purple-300">{reportes.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Pendientes:</span>
                    <span className="font-bold text-yellow-400">{reportes.filter(r => r.estado === 'pendiente').length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Revisados:</span>
                    <span className="font-bold text-blue-400">{reportes.filter(r => r.estado === 'revisado').length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Resueltos:</span>
                    <span className="font-bold text-green-400">{reportes.filter(r => r.estado === 'resuelto').length}</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ProcessIcon />
                  <h4 className="font-semibold text-blue-300 text-lg">Proceso</h4>
                </div>
                <ul className="text-blue-200 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="text-blue-400">•</span>
                    Revisar contenido reportado
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-blue-400">•</span>
                    Verificar políticas
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-blue-400">•</span>
                    Tomar acción apropiada
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ActionsIcon />
                  <h4 className="font-semibold text-green-300 text-lg">Acciones</h4>
                </div>
                <ul className="text-green-200 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="text-green-400">•</span>
                    Marcar como revisado
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-400">•</span>
                    Resolver reporte
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-400">•</span>
                    Ver noticia original
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upgrades' && (
          // ... (tu código existente de upgrades se mantiene igual) ...
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <UpgradesIcon />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Solicitudes de Upgrade</h2>
                <p className="text-gray-300 text-lg">
                  Gestiona las solicitudes de upgrade al plan Plus de los usuarios
                </p>
              </div>
            </div>

            {solicitudesUpgrade.length === 0 ? (
              <div className="text-center py-12 bg-gray-700/30 rounded-2xl border border-gray-600/50">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <CheckIcon />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No hay solicitudes pendientes</h3>
                  <p className="text-gray-300">
                    No hay solicitudes de upgrade pendientes de revisión.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-700/30 backdrop-blur-lg rounded-2xl border border-gray-600/50 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-600/50">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Código Yape
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Fecha Solicitud
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/30 divide-y divide-gray-600/50">
                    {solicitudesUpgrade.map((solicitud) => (
                      <tr key={solicitud.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-white">
                            {solicitud.usuario_nombre}
                          </div>
                          <div className="text-sm text-gray-400">
                            {solicitud.usuario_email}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {solicitud.usuario_id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-mono text-white bg-gray-700/80 px-4 py-3 rounded-xl border border-gray-600/50">
                            {solicitud.codigo_yape}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Código de confirmación</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                          <br />
                          <span className="text-xs">
                            {new Date(solicitud.fecha_solicitud).toLocaleTimeString('es-ES')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-green-400">
                            S/ {(solicitud.monto / 100).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Plan: {solicitud.plan_solicitado}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleProcesarSolicitudUpgrade(solicitud.id, 'aprobado')}
                                className="flex items-center justify-center gap-2 flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                <ApproveIcon />
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleProcesarSolicitudUpgrade(solicitud.id, 'rechazado')}
                                className="flex items-center justify-center gap-2 flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                <RejectIcon />
                                Rechazar
                              </button>
                            </div>
                            <div className="text-xs text-gray-400 text-center bg-gray-700/50 py-1 rounded-lg border border-gray-600/50">
                              Actual Plan: Free → Plus
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Información adicional sobre upgrades */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MetricsIcon />
                  <h4 className="font-semibold text-blue-300 text-lg">Estadísticas de Upgrades</h4>
                </div>
                <ul className="text-blue-200 space-y-2">
                  <li className="flex justify-between">
                    <span>Solicitudes pendientes:</span>
                    <span className="font-bold text-blue-300">{solicitudesUpgrade.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Monto total pendiente:</span>
                    <span className="font-bold text-green-400">S/ {(solicitudesUpgrade.reduce((sum, s) => sum + s.monto, 0) / 100).toFixed(2)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Plan solicitado:</span>
                    <span className="font-bold text-yellow-400">Plus (S/ 19.90)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ProcessIcon />
                  <h4 className="font-semibold text-green-300 text-lg">Proceso de Aprobación</h4>
                </div>
                <ul className="text-green-200 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-500/30 rounded-full flex items-center justify-center text-green-300 text-xs">1</span>
                    Verificar código Yape del usuario
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-500/30 rounded-full flex items-center justify-center text-green-300 text-xs">2</span>
                    Aprobar solicitud si el pago es válido
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-500/30 rounded-full flex items-center justify-center text-green-300 text-xs">3</span>
                    El usuario recibirá automáticamente el plan Plus
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional para admin */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MetricsIcon />
              <h3 className="font-semibold text-blue-300 text-lg">Métricas Rápidas</h3>
            </div>
            <ul className="text-blue-200 space-y-2">
              <li className="flex justify-between">
                <span>Total noticias:</span>
                <span className="font-bold text-blue-300">{estadisticas.total_noticias}</span>
              </li>
              <li className="flex justify-between">
                <span>Reportes pendientes:</span>
                <span className="font-bold text-yellow-400">{reportes.filter(r => r.estado === 'pendiente').length}</span>
              </li>
              <li className="flex justify-between">
                <span>Upgrades pendientes:</span>
                <span className="font-bold text-green-400">{solicitudesUpgrade.length}</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ActionsIcon />
              <h3 className="font-semibold text-green-300 text-lg">Acciones Rápidas</h3>
            </div>
            <ul className="text-green-200 space-y-2">
              <li className="flex items-center gap-3">
                <span className="text-green-400">•</span>
                Ejecutar scraping
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">•</span>
                Revisar reportes
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">•</span>
                Gestionar upgrades
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <PrivilegesIcon />
              <h3 className="font-semibold text-purple-300 text-lg">Privilegios Admin</h3>
            </div>
            <ul className="text-purple-200 space-y-2">
              <li className="flex items-center gap-3">
                <span className="text-purple-400">•</span>
                Acceso completo al sistema
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">•</span>
                Gestión de reportes y upgrades
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">•</span>
                Todas las funciones Plus
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <UserAccountFab user={user} />
    </div>
  );
};

export default AdminDashboard;