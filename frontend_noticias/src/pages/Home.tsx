import React, { useState, useEffect } from 'react';
import type { Noticia, ScrapingResponse } from '../types';
import { newsApi } from '../api/newsApi';
import NewsList from '../components/NewsList';
import CategoryFilter from '../components/CategoryFilter';
import SourceFilter from '../components/SourceFilter';
import ScrapeButton from '../components/ScrapeButton';
import LoadingSpinner from '../components/LoadingSpinner';

interface HomeProps {
  onNoticiaClick: (noticia: Noticia) => void;
  searchQuery: string;
}

const Home: React.FC<HomeProps> = ({ onNoticiaClick, searchQuery }) => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [fuentes, setFuentes] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState('');
  const [paginaActual, setPaginaActual] = useState(0);
  const noticiasPorPagina = 9;

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      realizarBusqueda(searchQuery);
    } else {
      cargarNoticias();
    }
  }, [paginaActual, categoriaSeleccionada, fuenteSeleccionada, searchQuery]);

  const cargarDatosIniciales = async () => {
    try {
      const [categoriasData, fuentesData] = await Promise.all([
        newsApi.getCategorias(),
        newsApi.getFuentes()
      ]);
      setCategorias(categoriasData.categorias);
      
      // Normalizar las fuentes para que sean consistentes
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
        // Para el filtro por fuente, usar el endpoint de noticias con parámetro fuente
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

  const handleScrapingComplete = (result: ScrapingResponse) => {
    // Recargar noticias después del scraping
    cargarNoticias();
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Resultados para: "${searchQuery}"` : 'Últimas Noticias'}
          </h1>
          <p className="text-gray-600">
            {searchQuery 
              ? `${noticias.length} resultados encontrados` 
              : 'Mantente informado con las últimas noticias'
            }
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <ScrapeButton onScrapingComplete={handleScrapingComplete} />
        </div>
      </div>

      {/* Filtros */}
      {!searchQuery && (
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Filtrar por categoría:</h3>
              <CategoryFilter
                categorias={categorias}
                categoriaSeleccionada={categoriaSeleccionada}
                onCategoriaChange={(categoria) => {
                  setCategoriaSeleccionada(categoria);
                  setFuenteSeleccionada(''); // Resetear fuente cuando se selecciona categoría
                  setPaginaActual(0);
                }}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Filtrar por fuente:</h3>
              <SourceFilter
                fuentes={fuentes}
                fuenteSeleccionada={fuenteSeleccionada}
                onFuenteChange={(fuente) => {
                  setFuenteSeleccionada(fuente);
                  setCategoriaSeleccionada(''); // Resetear categoría cuando se selecciona fuente
                  setPaginaActual(0);
                }}
              />
            </div>
          </div>

          {(categoriaSeleccionada || fuenteSeleccionada) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {categoriaSeleccionada && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Categoría: {categoriaSeleccionada}
                </span>
              )}
              {fuenteSeleccionada && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Fuente: {fuenteSeleccionada}
                </span>
              )}
              <button
                onClick={resetFiltros}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
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
        onNoticiaClick={onNoticiaClick}
      />

      {/* Paginación */}
      {!loading && noticias.length > 0 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={handlePaginaAnterior}
            disabled={paginaActual === 0}
            className={`px-4 py-2 rounded-lg font-medium ${
              paginaActual === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Anterior
          </button>
          
          <span className="text-gray-600">
            Página {paginaActual + 1}
          </span>
          
          <button
            onClick={handlePaginaSiguiente}
            disabled={noticias.length < noticiasPorPagina}
            className={`px-4 py-2 rounded-lg font-medium ${
              noticias.length < noticiasPorPagina
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;