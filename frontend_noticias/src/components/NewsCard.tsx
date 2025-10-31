import React from 'react';
import type { Noticia } from '../types';

interface NewsCardProps {
  noticia: Noticia;
  onClick: (noticia: Noticia) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ noticia, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(noticia)}
    >
      {noticia.imagen_url && (
        <img 
          src={noticia.imagen_url} 
          alt={noticia.titulo}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
          }}
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {noticia.categoria}
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {noticia.fuente}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {noticia.titulo}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {noticia.contenido || 'Sin contenido disponible'}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{new Date(noticia.fecha).toLocaleDateString('es-ES')}</span>
          <span>Leer más →</span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;