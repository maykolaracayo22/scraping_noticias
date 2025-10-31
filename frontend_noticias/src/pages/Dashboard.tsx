import React, { useState, useEffect } from 'react';
import type{ Estadisticas } from '../types';
import { newsApi } from '../api/newsApi';
import StatsDashboard from '../components/StatsDashboard';
import ScrapeButton from '../components/ScrapeButton';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const data = await newsApi.getEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      alert('Error cargando estadísticas. Revisa que el backend esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapingComplete = () => {
    // Recargar estadísticas después del scraping
    cargarEstadisticas();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error cargando estadísticas</h2>
          <button
            onClick={cargarEstadisticas}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Estadísticas</h1>
          <p className="text-gray-600 mt-2">
            Resumen completo de las noticias almacenadas en el sistema
          </p>
        </div>
        
        <ScrapeButton onScrapingComplete={handleScrapingComplete} />
      </div>

      <StatsDashboard estadisticas={estadisticas} />
    </div>
  );
};

export default Dashboard;