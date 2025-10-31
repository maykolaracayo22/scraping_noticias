import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Dashboard from './pages/Dashboard';
import type{ Noticia } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);

  const handleNoticiaClick = (noticia: Noticia) => {
    setSelectedNoticia(noticia);
    setCurrentPage('detail');
    // Navegar a la página de detalle
    window.location.href = `/noticia/${noticia.id}`;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('home');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setSearchQuery('');
    if (page === 'home' || page === 'dashboard') {
      // Navegar usando window.location para simplicidad
      window.location.href = page === 'home' ? '/' : '/dashboard';
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          onSearch={handleSearch}
        />
        
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  onNoticiaClick={handleNoticiaClick}
                  searchQuery={searchQuery}
                />
              } 
            />
            <Route 
              path="/noticia/:id" 
              element={<NewsDetail />} 
            />
            <Route 
              path="/dashboard" 
              element={<Dashboard />} 
            />
            <Route 
              path="*" 
              element={
                <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
                  <a href="/" className="text-blue-600 hover:text-blue-800">
                    Volver al inicio
                  </a>
                </div>
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center text-gray-600">
              <p>📰 NoticiasApp - Sistema de Agregación de Noticias</p>
              <p className="text-sm mt-2">Desarrollado con React, TypeScript y FastAPI</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;