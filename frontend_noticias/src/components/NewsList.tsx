import React from 'react';
import type{ Noticia } from '../types';
import NewsCard from './NewsCard';
import LoadingSpinner from './LoadingSpinner';

interface NewsListProps {
  noticias: Noticia[];
  loading: boolean;
  onNoticiaClick: (noticia: Noticia) => void;
}

const NewsList: React.FC<NewsListProps> = ({ noticias, loading, onNoticiaClick }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (noticias.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No se encontraron noticias</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {noticias.map((noticia) => (
        <NewsCard 
          key={noticia.id} 
          noticia={noticia} 
          onClick={onNoticiaClick}
        />
      ))}
    </div>
  );
};

export default NewsList;