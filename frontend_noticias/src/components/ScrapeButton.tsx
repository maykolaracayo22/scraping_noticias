import React, { useState } from 'react';
import type { ScrapingResponse } from '../types';
import { newsApi } from '../api/newsApi';

interface ScrapeButtonProps {
  onScrapingComplete?: (result: ScrapingResponse) => void;
}

const ScrapeButton: React.FC<ScrapeButtonProps> = ({ onScrapingComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scrapingResult, setScrapingResult] = useState<ScrapingResponse | null>(null);

  const handleScraping = async () => {
    setLoading(true);
    setShowResult(false);
    
    try {
      const result = await newsApi.ejecutarScraping();
      setScrapingResult(result);
      setShowResult(true);
      
      // Llamar al callback si existe
      if (onScrapingComplete) {
        onScrapingComplete(result);
      }
    } catch (error) {
      console.error('Error ejecutando scraping:', error);
      // Mostrar error en el modal
      setScrapingResult({
        mensaje: 'Error ejecutando scraping',
        noticias_obtenidas: 0,
        noticias_guardadas: 0,
        duplicados: 0,
        errores: 1
      });
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setScrapingResult(null);
  };

  return (
    <>
      <button
        onClick={handleScraping}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Actualizar noticias desde las fuentes"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Scrapeando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar Noticias</span>
          </>
        )}
      </button>

      {/* Modal de Resultados */}
      {showResult && scrapingResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {scrapingResult.mensaje.includes('Error') ? '❌ Error' : '✅ Scraping Completado'}
              </h3>
              <button
                onClick={handleCloseResult}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className={`p-3 rounded-lg ${
                  scrapingResult.noticias_guardadas > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="text-2xl font-bold text-green-600">
                    {scrapingResult.noticias_guardadas}
                  </div>
                  <div className="text-sm text-gray-600">Nuevas</div>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  scrapingResult.duplicados > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="text-2xl font-bold text-yellow-600">
                    {scrapingResult.duplicados}
                  </div>
                  <div className="text-sm text-gray-600">Duplicados</div>
                </div>
              </div>

              {/* Mensaje detallado */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  {scrapingResult.mensaje.includes('Error') 
                    ? 'Ocurrió un error durante el scraping. Por favor, intenta nuevamente.'
                    : 'El proceso de scraping se ha completado correctamente. Las noticias han sido actualizadas.'
                  }
                </p>
              </div>

              {/* Información adicional */}
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Noticias obtenidas:</span>
                  <span className="font-medium">{scrapingResult.noticias_obtenidas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Noticias guardadas:</span>
                  <span className="font-medium">{scrapingResult.noticias_guardadas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplicados:</span>
                  <span className="font-medium">{scrapingResult.duplicados}</span>
                </div>
                <div className="flex justify-between">
                  <span>Errores:</span>
                  <span className="font-medium">{scrapingResult.errores}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseResult}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScrapeButton;