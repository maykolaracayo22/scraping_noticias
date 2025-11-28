import React, { useState, useEffect, useRef } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { newsApi } from '../api/newsApi';

interface WelcomePageProps {
  onLogin: (userData: User, token: string) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRealLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      const loginData: LoginRequest = { email, password };
      const authResponse = await newsApi.login(loginData);
      onLogin(authResponse.usuario, authResponse.access_token);
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRealRegister = async (email: string, password: string, nombre: string) => {
    setLoading(true);
    setError('');
    
    try {
      const registerData: RegisterRequest = { email, password, nombre };
      await newsApi.register(registerData);
      
      // Auto-login después del registro
      const loginData: LoginRequest = { email, password };
      const authResponse = await newsApi.login(loginData);
      onLogin(authResponse.usuario, authResponse.access_token);
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Componente de Fondo Galáctico
  const GalacticBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Configurar canvas
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Crear estrellas
      const stars: Array<{
        x: number;
        y: number;
        z: number;
        size: number;
        speed: number;
        opacity: number;
        isMoving: boolean;
      }> = [];

      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          isMoving: Math.random() > 0.6
        });
      }

      // Animación
      const animate = () => {
        ctx.fillStyle = 'rgb(0, 0, 10)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar nebulosa
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.3,
          canvas.height * 0.7,
          0,
          canvas.width * 0.3,
          canvas.height * 0.7,
          canvas.width * 0.8
        );
        gradient.addColorStop(0, 'rgba(25, 25, 112, 0.4)');
        gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Actualizar y dibujar estrellas
        stars.forEach((star) => {
          if (star.isMoving) {
            star.z -= star.speed;
            if (star.z <= 0) {
              star.z = 1000;
              star.x = Math.random() * canvas.width;
              star.y = Math.random() * canvas.height;
            }
          }

          const x = (star.x - canvas.width / 2) * (1000 / star.z) + canvas.width / 2;
          const y = (star.y - canvas.height / 2) * (1000 / star.z) + canvas.height / 2;
          const size = star.size * (1000 / star.z);
          const opacity = star.opacity * (1000 / star.z);

          if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();

            // Efecto de brillo para estrellas grandes
            if (size > 1.5) {
              const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
              glow.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.3})`);
              glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
              
              ctx.beginPath();
              ctx.arc(x, y, size * 3, 0, Math.PI * 2);
              ctx.fillStyle = glow;
              ctx.fill();
            }
          }
        });

        requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    );
  };

  // Componente Modal de Autenticación - Tema Galáctico
const AuthModal: React.FC<{ 
  isLogin: boolean; 
  onClose: () => void; 
  onSwitchMode: () => void;
}> = ({ isLogin, onClose, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (isLogin) {
      await handleRealLogin(email, password);
    } else {
      await handleRealRegister(email, password, nombre);
    }
  };

  // Iconos SVG
  const RocketIcon = () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const StarsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-blue-900/80 to-purple-900/80 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex min-h-[600px] border border-gray-700/50">
        
        {/* LEFT SIDE - Galactic Background */}
        <div className="hidden md:flex flex-1 relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8 flex-col justify-between overflow-hidden">
          {/* Efecto de estrellas sutiles */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-20 right-16 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-32 left-20 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-40 left-32 w-1 h-1 bg-white rounded-full"></div>
          </div>
          
          {/* Nebulosa gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          
          {/* Welcome Content */}
          <div className="relative z-10">
            <p className="text-blue-300 text-lg font-light mb-8">Welcome to</p>
            
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl mb-4 border border-blue-400/30">
                <RocketIcon />
              </div>
              <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                NewsPerú
              </h2>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              La plataforma más innovadora de noticias peruanas. Accede a contenido exclusivo, 
              reporta noticias inapropiadas y mantente informado con las últimas noticias en tiempo real.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-300/70 text-xs mb-2">
              <StarsIcon />
              <span>CREATED WITH ❤️</span>
            </div>
            <p className="text-blue-300/70 text-xs">FOR PERUVIAN NEWS</p>
          </div>
        </div>

        {/* RIGHT SIDE - Dark Form Background */}
        <div className="flex-1 p-8 flex flex-col justify-center relative bg-gray-900/90 backdrop-blur-lg">
          <div className="max-w-md mx-auto w-full">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
            </h3>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (only for register) */}
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                    placeholder="Nombre completo"
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                  placeholder="Email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                  placeholder="Contraseña"
                  required
                />
              </div>

              {/* Confirm Password (only for register) */}
              {!isLogin && (
                <div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                    placeholder="Confirmar contraseña"
                    required
                  />
                </div>
              )}

              {/* Terms & Conditions (only for register) */}
              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    Al registrarme acepto los{' '}
                    <button type="button" className="text-blue-400 hover:text-blue-300 font-medium">
                      Términos & Condiciones
                    </button>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg transform hover:scale-105 border border-blue-500/30"
              >
                {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </button>

              {/* Switch Mode Button */}
              <button
                type="button"
                onClick={onSwitchMode}
                className="w-full border-2 border-blue-500/50 text-blue-400 py-3 rounded-lg font-semibold hover:bg-blue-500/10 transition-colors"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Fondo Galáctico */}
      <GalacticBackground />
      
      {/* Overlay para mejor contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10" />

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/40 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className="text-3xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  NewsPerú
                </span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white font-semibold transition-all duration-300 hover:scale-110">Características</a>
                <a href="#plans" className="text-gray-300 hover:text-white font-semibold transition-all duration-300 hover:scale-110">Planes</a>
                <a href="#about" className="text-gray-300 hover:text-white font-semibold transition-all duration-300 hover:scale-110">Nosotros</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 py-5">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Bienvenido a 
              <span className="block mt-4 bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                NewsPerú
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              La plataforma más innovadora de noticias peruanas. 
              <span className="block mt-2 text-white/90">Contenido exclusivo, reportes en tiempo real y análisis avanzado.</span>
            </p>

            {/* GIF Animado con efectos */}
            <div className="mb-20 flex justify-center">
              <div className="relative max-w-2xl w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <img 
                  src="src/assets/noticias.gif" 
                  alt="Demo de NewsPerú - Plataforma de noticias en tiempo real"
                  className="relative w-full h-auto rounded-2xl shadow-2xl border-2 border-blue-500/30 transform group-hover:scale-105 transition-transform duration-500 z-10 max-h-64 object-cover"
                />
                {/* Efecto de brillo en los bordes */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-30 blur transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Features Grid Mejorado */}
            <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl border border-blue-500/30 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-blue-400/50">
                  <h3 className="text-2xl font-bold text-white mb-4">Noticias en Tiempo Real</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Información actualizada al instante de todos los medios peruanos. 
                    Nunca te pierdas una noticia importante con nuestro sistema de actualización continua.
                  </p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/30 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-purple-400/50">
                  <h3 className="text-2xl font-bold text-white mb-4">Contenido Verificado</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Sistema avanzado de verificación y reportes para combatir la desinformación. 
                    Contribuye a mantener una comunidad informada y confiable.
                  </p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl border border-cyan-500/30 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-cyan-400/50">
                  <h3 className="text-2xl font-bold text-white mb-4">Analítica Avanzada</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Dashboard interactivo con estadísticas detalladas y tendencias. 
                    Exporta datos y obtén insights valiosos para tu análisis.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info Mejorado */}
            <div className="bg-gray-900/60 backdrop-blur-lg rounded-3xl p-12 max-w-4xl mx-auto border border-gray-700 shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">
                ¿Por qué elegir NewsPerú?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="flex items-start space-x-4 group">
                  <span className="text-green-400 text-xl group-hover:scale-125 transition-transform mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">Contenido Verificado</h4>
                    <p className="text-gray-400 mt-1">Noticias de fuentes confiables y verificadas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <span className="text-green-400 text-xl group-hover:scale-125 transition-transform mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">Interfaz Intuitiva</h4>
                    <p className="text-gray-400 mt-1">Diseño moderno y fácil de usar</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <span className="text-green-400 text-xl group-hover:scale-125 transition-transform mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">Multiplataforma</h4>
                    <p className="text-gray-400 mt-1">Accede desde cualquier dispositivo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <span className="text-green-400 text-xl group-hover:scale-125 transition-transform mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">Soporte 24/7</h4>
                    <p className="text-gray-400 mt-1">Equipo de soporte siempre disponible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Action Button Mejorado */}
        <button
          onClick={() => setShowAuthModal(true)}
          className="fixed bottom-8 right-8 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-40 backdrop-blur-lg border border-white/20 group"
          title="Iniciar Sesión"
        >
          <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {/* Modal de Autenticación */}
        {showAuthModal && (
          <AuthModal 
            isLogin={isLogin} 
            onClose={() => {
              setShowAuthModal(false);
              setError('');
            }}
            onSwitchMode={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          />
        )}

        {/* Footer Mejorado */}
        <footer className="bg-black/40 backdrop-blur-md border-t border-gray-800 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-2xl font-bold text-white">NewsPerú</span>
            </div>
            <p className="text-gray-400 mb-4">
              © 2024 NewsPerú. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm">
              Desarrollado con React, TypeScript y FastAPI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;