import React, { useState } from 'react';
import type{ ScrapingResponse } from '../types';
import { newsApi } from '../api/newsApi';

interface ScrapeButtonProps {
  onScrapingComplete: (result: ScrapingResponse) => void;
}

const ScrapeButton: React.FC<ScrapeButtonProps> = ({ onScrapingComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleScraping = async () => {
    setLoading(true);
    try {
      const result = await newsApi.ejecutarScraping();
      onScrapingComplete(result);
      
      // Mostrar alerta con resultados
      alert(`Scraping completado:\nNuevas: ${result.noticias_guardadas}\nDuplicados: ${result.duplicados}\nErrores: ${result.errores}`);
    } catch (error) {
      console.error('Error ejecutando scraping:', error);
      alert('Error ejecutando scraping. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleScraping}
      disabled={loading}
      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
        loading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-orange-600 hover:bg-orange-700 text-white'
      }`}
    >
      {loading ? 'Actualizando...' : '🔄 Actualizar Noticias'}
    </button>
  );
};

export default ScrapeButton;