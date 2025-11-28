import React, { useState, useEffect } from 'react';
import type { User, SolicitudUpgrade } from '../types';
import { newsApi } from '../api/newsApi';
import ChatBotModal from './ChatBotModal';

interface UserAccountFabProps {
  user: User;
}

const UserAccountFab: React.FC<UserAccountFabProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudUpgrade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showAccountModal) {
      cargarSolicitudes();
    }
  }, [showAccountModal]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await newsApi.obtenerMisSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChatBotClick = () => {
    setIsMenuOpen(false);
    setShowChatBot(true);
  };

  const handleAccountClick = () => {
    setIsMenuOpen(false);
    setShowAccountModal(true);
  };

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    console.log('Abrir configuración');
    // Aquí puedes implementar la lógica para abrir configuración
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'plus':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'admin':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      default:
        return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'plus':
        return '💎';
      case 'admin':
        return '👑';
      default:
        return '👤';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const menuItems = [
    {
      label: '💬 ChatBot Noticias',
      onClick: handleChatBotClick,
      disabled: user.plan !== 'plus' && user.plan !== 'admin',
      title: user.plan !== 'plus' && user.plan !== 'admin' ? 'Requiere plan Plus' : 'ChatBot inteligente'
    },
    {
      label: '👤 Mi Cuenta',
      onClick: handleAccountClick,
      disabled: false
    },
    {
      label: '⚙️ Configuración',
      onClick: handleSettingsClick,
      disabled: false
    }
  ];

  return (
    <>
      {/* Floating Action Button con Menú */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Menu desplegable */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header del usuario */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="font-semibold">
                    {user.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{user.nombre}</div>
                  <div className="text-purple-200 text-sm">
                    Plan: {user.plan === 'admin' ? 'Admin' : user.plan}
                  </div>
                </div>
              </div>
            </div>

            {/* Items del menu */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  title={item.title}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.label.split(' ')[0]}</span>
                    <span>{item.label.split(' ').slice(1).join(' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón flotante principal */}
        <button
          onClick={toggleMenu}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Modal del ChatBot */}
      <ChatBotModal
        isOpen={showChatBot}
        onClose={() => setShowChatBot(false)}
        userPlan={user.plan}
      />

      {/* Modal de Detalles de Cuenta */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Mi Cuenta</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Información del Usuario */}
            <div className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-2xl">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{user.nombre}</h4>
                <p className="text-gray-600">{user.email}</p>
                
                {/* Badge del Plan */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getPlanColor(user.plan)}`}>
                  <span className="mr-1">{getPlanIcon(user.plan)}</span>
                  Plan {user.plan === 'admin' ? 'Administrador' : user.plan === 'plus' ? 'Plus' : 'Free'}
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {solicitudes.length}
                  </div>
                  <div className="text-xs text-gray-600">Solicitudes</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {solicitudes.filter(s => s.estado === 'aprobado').length}
                  </div>
                  <div className="text-xs text-gray-600">Aprobadas</div>
                </div>
              </div>

              {/* Estado del Plan */}
              {user.plan === 'free' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">💡 Plan Free</h5>
                  <p className="text-yellow-700 text-sm">
                    Tienes acceso a funciones básicas. Actualiza a Plus para desbloquear todas las características.
                  </p>
                </div>
              )}

              {user.plan === 'plus' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-2">🎉 Plan Plus Activo</h5>
                  <p className="text-green-700 text-sm">
                    Disfruta de todas las funciones premium incluyendo exportación de datos y acceso completo.
                  </p>
                </div>
              )}

              {/* Historial de Solicitudes */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">📋 Historial de Solicitudes</h5>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Cargando...</p>
                  </div>
                ) : solicitudes.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">No hay solicitudes registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {solicitudes.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">
                            Upgrade a {solicitud.plan_solicitado}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                            {solicitud.estado}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Monto:</span>
                            <span className="font-mono">S/ {(solicitud.monto / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fecha:</span>
                            <span>{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}</span>
                          </div>
                          {solicitud.codigo_yape && (
                            <div className="flex justify-between">
                              <span>Código Yape:</span>
                              <span className="font-mono">{solicitud.codigo_yape}</span>
                            </div>
                          )}
                          {solicitud.notas_admin && (
                            <div className="mt-1">
                              <span className="font-medium">Notas:</span>
                              <p className="text-gray-700">{solicitud.notas_admin}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Información Adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">ℹ️ Información de la Cuenta</h5>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Rol:</span>
                    <span className="capitalize">{user.rol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="text-green-600 font-medium">Activo</span>
                  </div>
                  {user.fecha_creacion && (
                    <div className="flex justify-between">
                      <span>Miembro desde:</span>
                      <span>{new Date(user.fecha_creacion).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>ID: {user.id}</span>
                <button
                  onClick={cargarSolicitudes}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  🔄 Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAccountFab;