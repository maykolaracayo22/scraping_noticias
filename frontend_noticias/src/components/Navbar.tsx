import React from 'react';
import SearchBar from './SearchBar';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onSearch: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange, onSearch }) => {
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Navegación */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl">📰</span>
              <span className="ml-2 text-xl font-bold text-gray-800">NoticiasApp</span>
            </div>
            
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => onPageChange('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'home' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => onPageChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-md mx-4">
            <SearchBar onSearch={onSearch} placeholder="Buscar noticias..." />
          </div>

          {/* Botón móvil */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;