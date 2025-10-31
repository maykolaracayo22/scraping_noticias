import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type{ Noticia } from '../types';
import { newsApi } from '../api/newsApi';
import LoadingSpinner from '../components/LoadingSpinner';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

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
      navigate('/');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Noticia no encontrada</h2>
          <button
            onClick={handleVolver}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Botón volver */}
      <button
        onClick={handleVolver}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>

      {/* Contenido de la noticia */}
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Imagen */}
        {noticia.imagen_url && (
          <img 
            src={noticia.imagen_url} 
            alt={noticia.titulo}
            className="w-full h-64 md:h-96 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Sin+Imagen';
            }}
          />
        )}

        <div className="p-6">
          {/* Metadatos */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
              {noticia.categoria}
            </span>
            <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded">
              {noticia.fuente}
            </span>
            <span className="text-gray-500 text-sm">
              {new Date(noticia.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {noticia.titulo}
          </h1>

          {/* Contenido */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {noticia.contenido || 'No hay contenido disponible para esta noticia.'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-4 pt-6 border-t">
            <button
              onClick={handleAbrirOriginal}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver noticia original
            </button>
            
            <button
              onClick={handleVolver}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Volver al listado
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;