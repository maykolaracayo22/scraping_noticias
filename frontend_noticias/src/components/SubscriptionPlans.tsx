import React, { useState, useEffect, useRef } from 'react';
import YapePaymentModal from './YapePaymentModal';
import UserUpgradeStatus from './UserUpgradeStatus';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  moneda: string;
  caracteristicas: string[];
  popular?: boolean;
  tipo: 'free' | 'plus' | 'enterprise';
}

interface SubscriptionPlansProps {
  currentPlan?: string;
  onPlanChange?: (nuevoPlan: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  currentPlan = 'free', 
  onPlanChange 
}) => {
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null);
  const [mostrarYapeModal, setMostrarYapeModal] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [tieneSolicitudPendiente, setTieneSolicitudPendiente] = useState(false);

  // Componente de Fondo Galáctico para SubscriptionPlans
  const GalacticBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const stars: Array<{
        x: number;
        y: number;
        z: number;
        size: number;
        speed: number;
        opacity: number;
        isMoving: boolean;
      }> = [];

      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.6 + 0.2,
          isMoving: Math.random() > 0.7
        });
      }

      const animate = () => {
        ctx.fillStyle = 'rgb(0, 0, 15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Nebulosa sutil
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.7,
          canvas.height * 0.3,
          0,
          canvas.width * 0.7,
          canvas.height * 0.3,
          canvas.width * 0.6
        );
        gradient.addColorStop(0, 'rgba(30, 30, 120, 0.3)');
        gradient.addColorStop(0.5, 'rgba(80, 0, 140, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Estrellas
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

            // Brillo para estrellas grandes
            if (size > 1.2) {
              const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
              glow.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.2})`);
              glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
              
              ctx.beginPath();
              ctx.arc(x, y, size * 2, 0, Math.PI * 2);
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
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    );
  };

  const planes: Plan[] = [
    {
      id: 'free',
      nombre: 'Free',
      precio: 0,
      moneda: 'S/',
      tipo: 'free',
      caracteristicas: [
        '✅ Acceso a noticias básicas',
        '✅ Búsqueda y filtros',
        '✅ Reportar noticias',
        '✅ Scraping básico',
        '❌ Exportar Excel',
        '❌ Scraping avanzado'
      ]
    },
    {
      id: 'plus',
      nombre: 'Plus',
      precio: 19.90,
      moneda: 'S/',
      tipo: 'plus',
      popular: true,
      caracteristicas: [
        '✅ Todas las funciones Free',
        '✅ Exportar Excel',
        '✅ Scraping avanzado',
        '✅ Contenido exclusivo',
        '✅ Noticias sin publicidad',
        '✅ Soporte prioritario'
      ]
    }
  ];

  const handleSeleccionarPlan = (planId: string) => {
    if (planId === 'free' || tieneSolicitudPendiente) {
      return;
    }
    
    setPlanSeleccionado(planId);
    setMostrarYapeModal(true);
  };

  const handlePagoExitoso = (solicitud: any) => {
    setSolicitudEnviada(true);
    setTieneSolicitudPendiente(true);
    alert(`✅ Solicitud de upgrade enviada correctamente\n\n📧 Tu solicitud ha sido enviada al administrador. Recibirás una notificación cuando sea procesada.\n\nID de solicitud: ${solicitud.id}`);
  };

  const handleSolicitudAprobada = () => {
    setTieneSolicitudPendiente(false);
    if (onPlanChange) {
      onPlanChange('plus');
    }
  };

  const planSeleccionadoObj = planes.find(p => p.id === planSeleccionado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Fondo Galáctico */}
      <GalacticBackground />
      
      {/* Overlay para mejor contraste */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Contenido */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-gray-300 text-lg">
            {currentPlan === 'free' 
              ? 'Actualmente tienes el plan Free. Actualiza para desbloquear más funciones.' 
              : `Actualmente tienes el plan ${currentPlan}.`}
          </p>
        </div>

        {/* Estado de solicitudes del usuario */}
        <UserUpgradeStatus onSolicitudAprobada={handleSolicitudAprobada} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 transition-all hover:shadow-2xl hover:scale-105 backdrop-blur-lg ${
                plan.popular
                  ? 'border-green-500 bg-gradient-to-br from-green-900/60 to-emerald-900/40'
                  : plan.id === currentPlan
                  ? 'border-blue-500 bg-gradient-to-br from-blue-900/60 to-cyan-900/40'
                  : 'border-gray-600 bg-gradient-to-br from-gray-800/60 to-gray-900/40'
              } ${tieneSolicitudPendiente && plan.id !== 'free' ? 'opacity-70' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Más Popular
                  </span>
                </div>
              )}

              {plan.id === currentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Plan Actual
                  </span>
                </div>
              )}

              {tieneSolicitudPendiente && plan.id !== 'free' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Solicitud Pendiente
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {plan.nombre}
                </h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.moneda} {plan.precio.toFixed(2)}
                  </span>
                  {plan.precio > 0 && (
                    <span className="text-gray-300 ml-2 text-lg">/mes</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.caracteristicas.map((caracteristica, index) => (
                  <li key={index} className="flex items-start">
                    <span
                      className={`mr-3 mt-1 text-lg ${
                        caracteristica.includes('✅')
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {caracteristica.includes('✅') ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-300 text-base">
                      {caracteristica.replace('✅', '').replace('❌', '')}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSeleccionarPlan(plan.id)}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 text-lg ${
                  plan.id === currentPlan
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500'
                    : tieneSolicitudPendiente
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600'
                    : plan.popular
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl hover:scale-105 border border-green-500/50'
                    : plan.precio === 0
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 hover:border-gray-500'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white shadow-lg hover:shadow-xl hover:scale-105 border border-blue-500/50'
                }`}
                disabled={plan.id === currentPlan || tieneSolicitudPendiente}
              >
                {plan.id === currentPlan 
                  ? 'Plan Actual' 
                  : tieneSolicitudPendiente
                  ? 'Solicitud Pendiente'
                  : plan.precio === 0 
                  ? 'Gratis' 
                  : `Suscribirse por ${plan.moneda} ${plan.precio.toFixed(2)}`
                }
              </button>
            </div>
          ))}
        </div>

        {/* Información sobre el proceso */}
        {currentPlan === 'free' && !tieneSolicitudPendiente && (
          <div className="mt-8 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-lg border border-yellow-500/40 rounded-2xl p-6">
            <h4 className="font-semibold text-yellow-300 mb-4 flex items-center gap-3 text-lg">
              <span className="text-xl">💡</span>
              Proceso de Activación
            </h4>
            <ol className="text-yellow-200/90 space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-300 text-sm font-bold">1</span>
                <span>Selecciona el plan Plus y realiza el pago con Yape</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-300 text-sm font-bold">2</span>
                <span>Ingresa el código de confirmación de 6 dígitos</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-300 text-sm font-bold">3</span>
                <span>El administrador revisará tu solicitud (máximo 24 horas)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-300 text-sm font-bold">4</span>
                <span>Recibirás una notificación cuando tu plan sea activado</span>
              </li>
            </ol>
          </div>
        )}

        {tieneSolicitudPendiente && (
          <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-blue-500/40 rounded-2xl p-6">
            <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-3 text-lg">
              <span className="text-xl">⏳</span>
              Solicitud en Proceso
            </h4>
            <p className="text-blue-200/90">
              Tienes una solicitud de upgrade pendiente. El administrador la revisará pronto.
              Puedes ver el estado de tu solicitud arriba.
            </p>
          </div>
        )}

        {/* Modal de pago con Yape */}
        {planSeleccionadoObj && (
          <YapePaymentModal
            isOpen={mostrarYapeModal}
            onClose={() => setMostrarYapeModal(false)}
            onSuccess={handlePagoExitoso}
            plan={planSeleccionadoObj}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;