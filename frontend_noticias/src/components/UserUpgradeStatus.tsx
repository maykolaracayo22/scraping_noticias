import React, { useState, useEffect } from 'react';
import type { SolicitudUpgrade } from '../types';
import { newsApi } from '../api/newsApi';

interface UserUpgradeStatusProps {
  onSolicitudAprobada?: () => void;
}

const UserUpgradeStatus: React.FC<UserUpgradeStatusProps> = ({ onSolicitudAprobada }) => {
  const [solicitudes, setSolicitudes] = useState<SolicitudUpgrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const data = await newsApi.obtenerMisSolicitudes();
      setSolicitudes(data);
      
      // Si hay una solicitud aprobada, notificar al componente padre
      const solicitudAprobada = data.find(s => s.estado === 'aprobado');
      if (solicitudAprobada && onSolicitudAprobada) {
        onSolicitudAprobada();
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '⏳ Pendiente de revisión';
      case 'aprobado':
        return '✅ Plan Activado';
      case 'rechazado':
        return '❌ Solicitud Rechazada';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (solicitudes.length === 0) {
    return null; // No mostrar nada si no hay solicitudes
  }

  const solicitudMasReciente = solicitudes[0]; // La más reciente primero

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getEstadoColor(solicitudMasReciente.estado)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Estado de tu solicitud Plus</h4>
          <p className="text-sm mb-2">
            {getEstadoTexto(solicitudMasReciente.estado)}
          </p>
          
          {solicitudMasReciente.estado === 'pendiente' && (
            <div className="text-xs space-y-1">
              <p>📧 Tu solicitud está siendo revisada por el administrador</p>
              <p>⏰ Tiempo estimado: 24 horas</p>
              <p>💰 Monto pagado: S/ {(solicitudMasReciente.monto / 100).toFixed(2)}</p>
              <p>🔢 Código Yape: <span className="font-mono">{solicitudMasReciente.codigo_yape}</span></p>
            </div>
          )}
          
          {solicitudMasReciente.estado === 'aprobado' && (
            <div className="text-xs space-y-1">
              <p>🎉 ¡Felicidades! Tu plan Plus ha sido activado</p>
              <p>✅ Ahora tienes acceso a todas las funciones premium</p>
              <p>📅 Fecha de aprobación: {new Date(solicitudMasReciente.fecha_revision!).toLocaleDateString('es-ES')}</p>
            </div>
          )}
          
          {solicitudMasReciente.estado === 'rechazado' && solicitudMasReciente.notas_admin && (
            <div className="text-xs">
              <p><strong>Motivo:</strong> {solicitudMasReciente.notas_admin}</p>
            </div>
          )}
        </div>
        
        <div className="text-right text-xs text-gray-600">
          <p>Solicitud #{solicitudMasReciente.id}</p>
          <p>{new Date(solicitudMasReciente.fecha_solicitud).toLocaleDateString('es-ES')}</p>
        </div>
      </div>
      
      {/* Botón para recargar estado */}
      <div className="mt-3 pt-3 border-t border-opacity-50">
        <button
          onClick={cargarSolicitudes}
          className="text-xs bg-white bg-opacity-50 hover:bg-opacity-100 px-3 py-1 rounded border"
        >
          🔄 Actualizar estado
        </button>
      </div>
    </div>
  );
};

export default UserUpgradeStatus;