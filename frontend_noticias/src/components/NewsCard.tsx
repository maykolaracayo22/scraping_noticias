import React, { useState } from 'react';
import type { Noticia } from '../types';
import AnalisisIAModal from './AnalisisIAModal';

interface NewsCardProps {
  noticia: Noticia;
  onClick: (noticia: Noticia) => void;
  onReport?: (noticiaId: number, motivo: string) => void;
  userPlan?: string;
  onShowPlans?: () => void; // Nueva prop
}

const NewsCard: React.FC<NewsCardProps> = ({ noticia, onClick, onReport, userPlan = 'free' }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAnalisisModal, setShowAnalisisModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Imagen por defecto basada en la categoría
  const getDefaultImage = (categoria: string) => {
    const categoryImages: { [key: string]: string } = {
      'política': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
      'deportes': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop',
      'economía': 'https://images.unsplash.com/photo-1665686377065-08ba896d16fd?w=400&h=200&fit=crop',
      'tecnología': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
      'entretenimiento': 'https://images.unsplash.com/photo-1489599809505-fb40ebc14d25?w=400&h=200&fit=crop',
      'salud': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
      'internacional': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&h=200&fit=crop',
      'ciencia': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop'
    };

    const defaultImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=200&fit=crop';
    
    return categoryImages[categoria?.toLowerCase()] || defaultImage;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReportModal(true);
  };

  const handleAnalizarIAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userPlan === 'plus' || userPlan === 'admin') {
      setShowAnalisisModal(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleLeerMasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(noticia);
  };

  const handleCardClick = () => {
    onClick(noticia);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !onReport) return;

    setIsReporting(true);
    try {
      await onReport(noticia.id, reportReason);
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Error al reportar noticia:', error);
    } finally {
      setIsReporting(false);
    }
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setReportReason('');
  };

  const reportReasons = [
    'Contenido inapropiado',
    'Información falsa',
    'Spam',
    'Contenido ofensivo',
    'Derechos de autor',
    'Otro'
  ];

  const imageUrl = !noticia.imagen_url || imageError 
    ? getDefaultImage(noticia.categoria)
    : noticia.imagen_url;

  return (
    <>
      <div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative cursor-pointer hover:scale-105"
        onClick={handleCardClick}
      >
        {/* Botón de reportar */}
        {onReport && (
          <button
            onClick={handleReportClick}
            className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-xl shadow-lg transition-all duration-300 z-10 hover:scale-110 backdrop-blur-sm"
            title="Reportar noticia"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </button>
        )}

        {/* Botón Analizar con IA - Visible para todos */}
        <button
          onClick={handleAnalizarIAClick}
          className={`absolute top-3 left-3 p-2 rounded-xl shadow-lg transition-all duration-300 z-10 hover:scale-110 backdrop-blur-sm ${
            userPlan === 'plus' || userPlan === 'admin'
              ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 hover:from-purple-600 hover:to-pink-600 text-white'
              : 'bg-gray-600/90 hover:bg-gray-700 text-gray-300'
          }`}
          title={
            userPlan === 'plus' || userPlan === 'admin' 
              ? "Analizar con IA" 
              : "Actualiza a Plus para análisis con IA"
          }
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        {/* Imagen de la noticia */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl}
            alt={noticia.titulo}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={handleImageError}
          />
          {/* Overlay gradiente */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
          
          {/* Badge de categoría sobre la imagen */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-blue-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm border border-blue-400/50">
              {noticia.categoria}
            </span>
          </div>

          {/* Badge IA - Visible para todos */}
          <div className="absolute bottom-3 right-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm border flex items-center gap-1 ${
              userPlan === 'plus' || userPlan === 'admin'
                ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white border-purple-400/50'
                : 'bg-gray-600/90 text-gray-300 border-gray-500/50'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              IA
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="bg-gray-700/80 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-600/50">
              {noticia.fuente}
            </span>
            <span className="text-gray-400 text-xs">
              {new Date(noticia.fecha).toLocaleDateString('es-ES')}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
            {noticia.titulo}
          </h3>
          
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
            {noticia.contenido || 'Descripción no disponible...'}
          </p>
          
          <div className="flex flex-wrap gap-2 justify-between items-center">
            {/* Botones de acción */}
            <div className="flex gap-2">
              {/* Botón Leer más - Para todos */}
              <button
                onClick={handleLeerMasClick}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Leer más ›
              </button>

              {/* Botón Analizar con IA - Visible para todos */}
              <button
                onClick={handleAnalizarIAClick}
                className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-1 ${
                  userPlan === 'plus' || userPlan === 'admin'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                    : 'bg-gray-700/80 text-gray-400 border border-gray-600/50'
                }`}
                title={
                  userPlan === 'plus' || userPlan === 'admin' 
                    ? "Analizar con IA" 
                    : "Actualiza a Plus para análisis con IA"
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                IA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Reporte */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              🚨 Reportar Noticia
            </h3>
            
            <div className="mb-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50">
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Título:</strong> {noticia.titulo}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                <strong>Fuente:</strong> {noticia.fuente} • <strong>Categoría:</strong> {noticia.categoria}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Motivo del reporte:
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-3 bg-gray-700/80 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              >
                <option value="" className="text-gray-400">Selecciona un motivo</option>
                {reportReasons.map((reason) => (
                  <option key={reason} value={reason} className="text-white">
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción adicional (opcional):
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Proporciona más detalles sobre el reporte..."
                className="w-full p-3 bg-gray-700/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm h-24 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                disabled={isReporting}
                className="px-5 py-2.5 text-gray-300 border border-gray-600/50 rounded-xl hover:bg-gray-700/50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason.trim() || isReporting}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                {isReporting ? '⏳ Reportando...' : '🚨 Reportar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Análisis IA */}
      <AnalisisIAModal
        noticia={noticia}
        isOpen={showAnalisisModal}
        onClose={() => setShowAnalisisModal(false)}
        userPlan={userPlan}
      />

      {/* Modal de Actualización a Plus */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                Análisis con IA
              </h3>
              
              <p className="text-gray-300 mb-6">
                Esta función avanzada está disponible exclusivamente para usuarios con plan <span className="text-purple-400 font-semibold">Plus</span>
              </p>

              <div className="bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-600/50">
                <h4 className="font-semibold text-white mb-3">💎 Beneficios del Plan Plus:</h4>
                <ul className="text-gray-300 text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Análisis completo con Inteligencia Artificial
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Resumen automático de noticias
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Análisis de sentimiento y categorización
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Detección de temas principales
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Exportación de datos a Excel
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-3 text-gray-300 border border-gray-600/50 rounded-xl hover:bg-gray-700/50 transition-colors"
                >
                  Tal vez después
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    // Abrir directamente el modal de SubscriptionPlans
                    document.dispatchEvent(new CustomEvent('showSubscriptionPlans'));
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Ver Planes Plus
                </button>
              </div>

              <p className="text-gray-400 text-xs mt-4">
                Solo S/ 19.90 mensual • Cancelación en cualquier momento
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewsCard;