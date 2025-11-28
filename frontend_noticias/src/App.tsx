import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Dashboard from './pages/Dashboard';
import WelcomePage from './pages/WelcomePage';
import AdminDashboard from './pages/AdminDashboard';
import type { Noticia, User } from './types';
import { newsApi, getAuthToken, clearAuthToken } from './api/newsApi';

// Crear contexto de autenticación
export const AuthContext = React.createContext<{
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await newsApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          clearAuthToken();
        }
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    clearAuthToken();
    setCurrentPage('home');
  };

  const handleNoticiaClick = (noticia: Noticia) => {
    setSelectedNoticia(noticia);
    setCurrentPage('detail');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('home');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setSearchQuery('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, loading: authLoading }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Mostrar Navbar solo si el usuario está autenticado */}
          {user && (
            <Navbar 
              currentPage={currentPage} 
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              user={user}
              onLogout={handleLogout}
            />
          )}
          
          <main>
            <Routes>
              {/* Ruta de bienvenida (pública) */}
              <Route 
                path="/welcome" 
                element={
                  user ? (
                    <Navigate to={user.rol === 'admin' ? '/admin' : '/user'} replace />
                  ) : (
                    <WelcomePage onLogin={handleLogin} />
                  )
                } 
              />
              
              {/* Ruta por defecto */}
              <Route 
                path="/" 
                element={
                  user ? (
                    <Navigate to={user.rol === 'admin' ? '/admin' : '/user'} replace />
                  ) : (
                    <Navigate to="/welcome" replace />
                  )
                } 
              />
              
              {/* Rutas de usuario */}
              <Route 
                path="/user" 
                element={
                  user ? (
                    user.rol === 'admin' ? (
                      <Navigate to="/admin" replace />
                    ) : (
                      <Home 
                        onNoticiaClick={handleNoticiaClick}
                        searchQuery={searchQuery}
                        user={user}
                      />
                    )
                  ) : (
                    <Navigate to="/welcome" replace />
                  )
                } 
              />
              
              {/* Rutas de administrador */}
              <Route 
                path="/admin" 
                element={
                  user && user.rol === 'admin' ? (
                    <AdminDashboard user={user} />
                  ) : user ? (
                    <Navigate to="/user" replace />
                  ) : (
                    <Navigate to="/welcome" replace />
                  )
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  user && user.rol === 'admin' ? (
                    <AdminDashboard user={user} />
                  ) : user ? (
                    <Navigate to="/user" replace />
                  ) : (
                    <Navigate to="/welcome" replace />
                  )
                } 
              />
              
              {/* Rutas existentes (protegidas) */}
              <Route 
                path="/noticia/:id" 
                element={
                  user ? (
                    <NewsDetail userPlan={user.plan} />  // ← Pasar el plan del usuario
                  ) : (
                    <Navigate to="/welcome" replace />
                  )
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  user ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/welcome" replace />
                  )
                } 
              />
              
              {/* Ruta de 404 */}
              <Route 
                path="*" 
                element={
                  <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
                    <a 
                      href={user ? (user.rol === 'admin' ? '/admin' : '/user') : '/welcome'} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Volver al inicio
                    </a>
                  </div>
                } 
              />
            </Routes>
          </main>

          {/* Footer - Mostrar solo si está autenticado */}
          {user && (
            <footer className="bg-white border-t mt-12">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="text-center text-gray-600">
                  <p>📰 NewsPerú - Sistema de Agregación de Noticias</p>
                  <p className="text-sm mt-2">
                    Usuario: {user.nombre} ({user.rol}) | Plan: {user.plan} | 
                    <button 
                      onClick={handleLogout}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Cerrar Sesión
                    </button>
                  </p>
                </div>
              </div>
            </footer>
          )}
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;