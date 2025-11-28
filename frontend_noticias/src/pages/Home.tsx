import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Noticia, ScrapingResponse, User, PlanInfo } from '../types';
import { newsApi } from '../api/newsApi';
import NewsList from '../components/NewsList';
import CategoryFilter from '../components/CategoryFilter';
import SourceFilter from '../components/SourceFilter';
import ScrapeButton from '../components/ScrapeButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ExportToExcel from '../components/ExportToExcel';
import SubscriptionPlans from '../components/SubscriptionPlans';
import UserAccountFab from '../components/UserAccountFab';

interface HomeProps {
  searchQuery: string;
  user: User;
}

const Home: React.FC<HomeProps> = ({ searchQuery, user }) => {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [fuentes, setFuentes] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState('');
  const [paginaActual, setPaginaActual] = useState(0);
  const [mostrarPlanes, setMostrarPlanes] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  const noticiasPorPagina = 9;


    // Agregar este useEffect para escuchar el evento
  useEffect(() => {
    const handleShowPlans = () => {
      setMostrarPlanes(true);
    };

    document.addEventListener('showSubscriptionPlans', handleShowPlans);
    
    return () => {
      document.removeEventListener('showSubscriptionPlans', handleShowPlans);
    };
  }, []);
  useEffect(() => {
    cargarDatosIniciales();
    cargarPlanInfo();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      realizarBusqueda(searchQuery);
    } else {
      cargarNoticias();
    }
  }, [paginaActual, categoriaSeleccionada, fuenteSeleccionada, searchQuery]);

  const cargarPlanInfo = async () => {
    try {
      const info = await newsApi.getPlanInfo();
      setPlanInfo(info);
    } catch (error) {
      console.error('Error cargando info del plan:', error);
    }
  };

  const cargarDatosIniciales = async () => {
    try {
      const [categoriasData, fuentesData] = await Promise.all([
        newsApi.getCategorias(),
        newsApi.getFuentes()
      ]);
      setCategorias(categoriasData.categorias);
      
      const fuentesNormalizadas = fuentesData.fuentes.map(fuente => {
        return fuente
          .replace('_', ' ')
          .split(' ')
          .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
          .join(' ');
      });
      
      setFuentes(fuentesNormalizadas);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const cargarNoticias = async () => {
    setLoading(true);
    try {
      let data: Noticia[];
      const skip = paginaActual * noticiasPorPagina;

      if (categoriaSeleccionada) {
        data = await newsApi.getNoticiasPorCategoria(categoriaSeleccionada, skip, noticiasPorPagina);
      } else if (fuenteSeleccionada) {
        data = await newsApi.getNoticias(skip, noticiasPorPagina, fuenteSeleccionada);
      } else {
        data = await newsApi.getNoticias(skip, noticiasPorPagina);
      }
      
      setNoticias(data);
    } catch (error) {
      console.error('Error cargando noticias:', error);
      alert('Error cargando noticias. Revisa que el backend esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const realizarBusqueda = async (query: string) => {
    setLoading(true);
    try {
      const data = await newsApi.buscarNoticias(query, paginaActual * noticiasPorPagina, noticiasPorPagina);
      setNoticias(data);
    } catch (error) {
      console.error('Error buscando noticias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoticiaClick = (noticia: Noticia) => {
    // Permitir a todos los usuarios leer las noticias
    navigate(`/noticia/${noticia.id}`);
  };

  const handleScrapingComplete = (result: ScrapingResponse) => {
    setTimeout(() => {
      cargarNoticias();
    }, 1000);
  };

  const handlePaginaSiguiente = () => {
    setPaginaActual(prev => prev + 1);
  };

  const handlePaginaAnterior = () => {
    setPaginaActual(prev => Math.max(0, prev - 1));
  };

  const resetFiltros = () => {
    setCategoriaSeleccionada('');
    setFuenteSeleccionada('');
    setPaginaActual(0);
  };

  const handleReportNews = async (noticiaId: number, motivo: string) => {
    try {
      await newsApi.reportarNoticia(noticiaId, motivo);
      alert('✅ Reporte enviado correctamente');
    } catch (error) {
      console.error('Error reportando noticia:', error);
      alert('❌ Error al enviar el reporte');
    }
  };

  const handleExportClick = () => {
    if (planInfo?.puede_exportar) {
      return;
    } else {
      setMostrarPlanes(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header - Manteniendo estructura original pero mejorado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">
              {searchQuery ? `Resultados para: "${searchQuery}"` : 'Últimas Noticias'}
            </h1>
            <p className="text-gray-300">
              {searchQuery 
                ? `${noticias.length} resultados encontrados` 
                : `Bienvenido, ${user.nombre} (Plan: ${user.plan})`
              }
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {/* Exportar Excel */}
            {planInfo?.puede_exportar ? (
              <ExportToExcel />
            ) : (
              <button
                onClick={handleExportClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors border border-gray-600"
                title="Necesitas plan Plus para exportar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exportar (Plus)</span>
              </button>
            )}
            
            {/* Botón Ver Planes - Corregido */}
            <button
              onClick={() => setMostrarPlanes(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>Ver Planes</span>
            </button>
            
            {/* ScrapeButton */}
            <ScrapeButton onScrapingComplete={handleScrapingComplete} />
          </div>
        </div>

        {/* Badge informativo para usuarios Free - Mejorado pero manteniendo estructura */}
        {user.plan === 'free' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-300">
                  Plan Free Activo
                </h3>
                <div className="mt-2 text-sm text-yellow-200">
                  <p>
                    Tienes acceso a scraping básico. 
                    <button 
                      onClick={() => setMostrarPlanes(true)}
                      className="ml-1 font-semibold underline hover:text-yellow-100"
                    >
                      Actualiza a Plus para desbloquear exportación de datos y más funciones.
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros - Manteniendo estructura original pero mejorados */}
        {!searchQuery && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Filtrar por categoría:</h3>
                <CategoryFilter
                  categorias={categorias}
                  categoriaSeleccionada={categoriaSeleccionada}
                  onCategoriaChange={(categoria) => {
                    setCategoriaSeleccionada(categoria);
                    setFuenteSeleccionada('');
                    setPaginaActual(0);
                  }}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Filtrar por fuente:</h3>
                <SourceFilter
                  fuentes={fuentes}
                  fuenteSeleccionada={fuenteSeleccionada}
                  onFuenteChange={(fuente) => {
                    setFuenteSeleccionada(fuente);
                    setCategoriaSeleccionada('');
                    setPaginaActual(0);
                  }}
                />
              </div>
            </div>

            {(categoriaSeleccionada || fuenteSeleccionada) && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-300">Filtros activos:</span>
                {categoriaSeleccionada && (
                  <span className="bg-blue-500/20 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-500/30">
                    Categoría: {categoriaSeleccionada}
                  </span>
                )}
                {fuenteSeleccionada && (
                  <span className="bg-green-500/20 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded border border-green-500/30">
                    Fuente: {fuenteSeleccionada}
                  </span>
                )}
                <button
                  onClick={resetFiltros}
                  className="text-sm text-red-400 hover:text-red-300 font-medium ml-auto"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lista de noticias */}
        <NewsList
          noticias={noticias}
          loading={loading}
          onNoticiaClick={handleNoticiaClick}
          onReport={handleReportNews}
          userPlan={user.plan}
        />

        {/* Paginación - Mejorada pero manteniendo estructura */}
        {!loading && noticias.length > 0 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={handlePaginaAnterior}
              disabled={paginaActual === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                paginaActual === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Anterior
            </button>
            
            <span className="text-gray-300">
              Página {paginaActual + 1}
            </span>
            
            <button
              onClick={handlePaginaSiguiente}
              disabled={noticias.length < noticiasPorPagina}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                noticias.length < noticiasPorPagina
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Modal de Planes de Suscripción - Manteniendo estructura original */}
        {mostrarPlanes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Planes de Suscripción</h2>
              <button
                onClick={() => setMostrarPlanes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SubscriptionPlans 
              currentPlan={user.plan}
              onPlanChange={(nuevoPlan) => {
                const usuarioActualizado = { ...user, plan: nuevoPlan };
                console.log('Plan actualizado:', nuevoPlan);
              }}
            />
          </div>
        )}

        {/* Floating Action Button para Mi Cuenta */}
        <UserAccountFab user={user} />
      </div>
    </div>
  );
};

export default Home;