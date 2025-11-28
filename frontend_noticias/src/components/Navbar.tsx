import React from 'react';

interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'user' | 'admin';
}

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onSearch: (query: string) => void;
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  onPageChange, 
  onSearch, 
  user,
  onLogout 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación */}
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => onPageChange('home')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                NewsPerú
              </span>
            </div>
            
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => onPageChange('home')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  currentPage === 'home' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                📰 Inicio
              </button>
              
              {/* Mostrar Dashboard solo si es admin */}
              {user.rol === 'admin' && (
                <button
                  onClick={() => onPageChange('dashboard')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    currentPage === 'dashboard' 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  ⚙️ Panel Admin
                </button>
              )}
            </div>
          </div>

          {/* Buscador y perfil */}
          <div className="flex items-center space-x-6">
            {/* Buscador */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar noticias..."
                  className="w-72 pl-4 pr-12 py-3 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Información del usuario */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-white">{user.nombre}</p>
                <p className="text-xs text-gray-300 capitalize bg-gray-700/50 px-2 py-1 rounded-full">
                  {user.rol}
                </p>
              </div>
              
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              
              {/* Botón de logout */}
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all duration-300 group"
                title="Cerrar Sesión"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Buscador móvil */}
        <div className="sm:hidden pb-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar noticias..."
                className="w-full pl-4 pr-12 py-3 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;