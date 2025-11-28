import React, { useState } from 'react';
import type { SolicitudUpgradeCreate } from '../types';
import { newsApi } from '../api/newsApi';

interface YapePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (solicitud: any) => void;
  plan: {
    nombre: string;
    precio: number;
    moneda: string;
  };
}

const YapePaymentModal: React.FC<YapePaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  plan 
}) => {
  const [codigoYape, setCodigoYape] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigoYape.trim()) {
      setError('Por favor ingresa el código Yape');
      return;
    }

    if (!/^\d{6}$/.test(codigoYape)) {
      setError('El código Yape debe tener exactamente 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const solicitudData: SolicitudUpgradeCreate = {
        plan_solicitado: 'plus',
        codigo_yape: codigoYape
      };

      const solicitud = await newsApi.crearSolicitudUpgrade(solicitudData);
      onSuccess(solicitud);
      onClose();
      setCodigoYape('');
      
    } catch (err: any) {
      setError(err.message || 'Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCodigoYape('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Pagar con Yape</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Información del pago */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-800 font-semibold">Plan {plan.nombre}</span>
            <span className="text-green-800 font-bold text-lg">
              {plan.moneda} {plan.precio.toFixed(2)}
            </span>
          </div>
          <p className="text-green-700 text-sm">
            Realiza el pago a través de Yape y ingresa el código de confirmación de 6 dígitos.
          </p>
        </div>

        {/* Instrucciones de pago */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Instrucciones de pago:</h4>
          <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
            <li>Abre Yape en tu celular</li>
            <li>Escanea el código QR o busca el número: <strong>999-888-777</strong></li>
            <li>Realiza el pago de <strong>{plan.moneda} {plan.precio.toFixed(2)}</strong></li>
            <li>Ingresa el código de confirmación de 6 dígitos</li>
          </ol>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Confirmación Yape (6 dígitos)
            </label>
            <input
              type="text"
              value={codigoYape}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCodigoYape(value);
                if (error) setError('');
              }}
              placeholder="123456"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Ingresa los 6 dígitos que recibiste en Yape
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || codigoYape.length !== 6}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                `Pagar ${plan.moneda} ${plan.precio.toFixed(2)}`
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Al realizar el pago, aceptas nuestros términos y condiciones.
            El administrador revisará tu solicitud y activará el plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default YapePaymentModal;