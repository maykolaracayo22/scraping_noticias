import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Noticia } from '../types';
import { newsApi } from '../api/newsApi';
import LoadingSpinner from '../components/LoadingSpinner';

interface NewsDetailProps {
  userPlan?: string;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ userPlan = 'free' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Imagen por defecto basada en la categoría
  const getDefaultImage = (categoria: string) => {
    const categoryImages: { [key: string]: string } = {
      'política': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      'deportes': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
      'economía': 'https://images.unsplash.com/photo-1665686377065-08ba896d16fd?w=800&h=400&fit=crop',
      'tecnología': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
      'entretenimiento': 'https://images.unsplash.com/photo-1489599809505-fb40ebc14d25?w=800&h=400&fit=crop',
      'salud': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
      'internacional': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=400&fit=crop',
      'ciencia': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop'
    };

    const defaultImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=400&fit=crop';
    
    return categoryImages[categoria?.toLowerCase()] || defaultImage;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    if (id) {
      cargarNoticia(parseInt(id));
    }
  }, [id]);

  const cargarNoticia = async (noticiaId: number) => {
    setLoading(true);
    try {
      const data = await newsApi.getNoticia(noticiaId);
      setNoticia(data);
    } catch (error) {
      console.error('Error cargando noticia:', error);
      alert('Error cargando la noticia. Puede que no exista.');
      navigate('/user');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const handleAbrirOriginal = () => {
    if (noticia?.enlace) {
      window.open(noticia.enlace, '_blank');
    }
  };

  const getPlanBadgeColor = () => {
    switch (userPlan) {
      case 'plus':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300';
      case 'admin':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300';
      default:
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300';
    }
  };

  const getPlanDisplayName = () => {
    switch (userPlan) {
      case 'plus':
        return 'Plus';
      case 'admin':
        return 'Admin';
      default:
        return 'Free';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Noticia no encontrada</h2>
          <button
            onClick={handleVolver}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = !noticia.imagen_url || imageError 
    ? getDefaultImage(noticia.categoria)
    : noticia.imagen_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Botón volver */}
        <button
          onClick={handleVolver}
          className="flex items-center text-blue-300 hover:text-blue-100 mb-6 transition-colors group"
        >
          <svg className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al listado
        </button>

        {/* Badge de plan activo */}
        <div className={`bg-gradient-to-r backdrop-blur-lg border rounded-2xl p-4 mb-6 ${getPlanBadgeColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`text-xl mr-3 ${
                userPlan === 'plus' ? 'text-green-400' : 
                userPlan === 'admin' ? 'text-purple-400' : 'text-blue-400'
              }`}>
                {userPlan === 'plus' ? '💎' : userPlan === 'admin' ? '👑' : '🆓'}
              </span>
              <span className="font-semibold text-lg">
                Plan {getPlanDisplayName()} Activo
              </span>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full border ${
              userPlan === 'plus' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
              userPlan === 'admin' ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' :
              'bg-blue-500/20 border-blue-500/30 text-blue-400'
            }`}>
              {userPlan === 'plus' ? 'Acceso completo' : 
               userPlan === 'admin' ? 'Acceso total' : 'Acceso básico'}
            </span>
          </div>
        </div>

        {/* Contenido de la noticia */}
        <article className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          {/* Imagen */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img 
              src={imageUrl}
              alt={noticia.titulo}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={handleImageError}
            />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent"></div>
            
            {/* Badges sobre la imagen */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-blue-500/90 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm border border-blue-400/50">
                {noticia.categoria}
              </span>
              <span className="bg-gray-800/90 text-gray-300 text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm border border-gray-600/50">
                {noticia.fuente}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Fecha */}
            <div className="mb-6">
              <span className="text-gray-400 text-sm">
                {new Date(noticia.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              {noticia.titulo}
            </h1>

            {/* Contenido */}
            <div className="prose prose-invert max-w-none mb-8">
              <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-line bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
                {noticia.contenido || 'No hay contenido disponible para esta noticia.'}
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-blue-300 mb-4 text-lg flex items-center gap-2">
                <span>📊</span>
                Información Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400">📰</span>
                  <div>
                    <strong className="text-blue-300">Fuente:</strong> {noticia.fuente}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400">🏷️</span>
                  <div>
                    <strong className="text-blue-300">Categoría:</strong> {noticia.categoria}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400">📅</span>
                  <div>
                    <strong className="text-blue-300">Fecha:</strong> {new Date(noticia.fecha).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400">🆔</span>
                  <div>
                    <strong className="text-blue-300">ID:</strong> {noticia.id}
                  </div>
                </div>
              </div>

              {/* Mensaje especial para usuarios Free */}
              {userPlan === 'free' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 text-xl">💡</span>
                    <div>
                      <strong className="text-purple-300">¿Quieres más funcionalidades?</strong>
                      <p className="text-purple-200 text-sm mt-1">
                        Actualiza a <strong>Plan Plus</strong> para desbloquear análisis con IA, exportación de datos y más.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-700/50">
              <button
                onClick={handleAbrirOriginal}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver noticia original
              </button>
              
              <button
                onClick={handleVolver}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Volver al listado
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;