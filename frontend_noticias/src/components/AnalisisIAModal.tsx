import React, { useState, useEffect } from 'react';
import type { AnalisisIAResponse, Noticia } from '../types';
import { newsApi } from '../api/newsApi';
import LoadingSpinner from './LoadingSpinner';

interface AnalisisIAModalProps {
  noticia: Noticia;
  isOpen: boolean;
  onClose: () => void;
  userPlan: string;
}

const AnalisisIAModal: React.FC<AnalisisIAModalProps> = ({
  noticia,
  isOpen,
  onClose,
  userPlan
}) => {
  const [analisis, setAnalisis] = useState<AnalisisIAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'analisis' | 'temas'>('resumen');

  useEffect(() => {
    if (isOpen && noticia) {
      cargarAnalisis();
    }
  }, [isOpen, noticia]);

  const cargarAnalisis = async () => {
    if (userPlan !== 'plus') {
      setError('PLUS_REQUIRED');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await newsApi.analizarNoticiaIA(noticia.id);
      setAnalisis(data);
    } catch (err: any) {
      if (err.message === 'PLUS_REQUIRED') {
        setError('PLUS_REQUIRED');
      } else {
        setError('Error al analizar la noticia con IA');
        console.error('Error analizando noticia:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getSentimientoColor = (sentimiento: string) => {
    switch (sentimiento) {
      case 'positivo': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'negativo': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getImportanciaColor = (puntuacion: number) => {
    if (puntuacion >= 8) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (puntuacion >= 6) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
  };

  if (!isOpen) return null;

  if (userPlan !== 'plus') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Análisis IA</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Función Exclusiva Plus</h4>
            <p className="text-gray-600 mb-4">
              El análisis con IA está disponible solo para usuarios con plan Plus.
            </p>
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div>
            <h3 className="text-xl font-bold">Análisis IA de Noticia</h3>
            <p className="text-purple-100 text-sm mt-1">{noticia.titulo}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-purple-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab('resumen')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'resumen'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Resumen IA
              </button>
              <button
                onClick={() => setActiveTab('analisis')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'analisis'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Análisis Detallado
              </button>
              <button
                onClick={() => setActiveTab('temas')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'temas'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Temas y Palabras
              </button>
            </nav>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="text-center py-12">
                <LoadingSpinner />
                <p className="text-gray-600 mt-4">Analizando noticia con IA...</p>
              </div>
            )}

            {error && error !== 'PLUS_REQUIRED' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Error en el análisis</h4>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={cargarAnalisis}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}

            {analisis && (
              <>
                {activeTab === 'resumen' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Resumen Generado por IA
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{analisis.analisis.resumen}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{analisis.analisis.puntuacion_importancia}/10</div>
                        <div className="text-sm text-gray-600">Importancia</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getSentimientoColor(analisis.analisis.sentimiento)}`}>
                          {analisis.analisis.sentimiento}
                        </span>
                        <div className="text-sm text-gray-600 mt-1">Sentimiento</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <div className="text-lg font-semibold text-gray-900">{analisis.analisis.categoria}</div>
                        <div className="text-sm text-gray-600">Categoría IA</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analisis' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Clasificación</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-600">Categoría Detectada:</span>
                            <div className="font-semibold text-purple-600">{analisis.analisis.categoria}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Sentimiento:</span>
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSentimientoColor(analisis.analisis.sentimiento)}`}>
                                {analisis.analisis.sentimiento}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Nivel de Importancia:</span>
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getImportanciaColor(analisis.analisis.puntuacion_importancia)}`}>
                                {analisis.analisis.puntuacion_importancia}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Metadatos</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fuente Original:</span>
                            <span className="font-medium">{analisis.noticia.fuente}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha Publicación:</span>
                            <span className="font-medium">{new Date(analisis.noticia.fecha).toLocaleDateString('es-ES')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Análisis Realizado:</span>
                            <span className="font-medium">{new Date(analisis.analisis.fecha_analisis).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'temas' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Temas Principales Detectados</h4>
                      <div className="flex flex-wrap gap-2">
                        {analisis.analisis.temas_principales.map((tema, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium border border-purple-200"
                          >
                            {tema}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Palabras Clave</h4>
                      <div className="flex flex-wrap gap-2">
                        {analisis.analisis.palabras_clave.map((palabra, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                          >
                            {palabra}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalisisIAModal;