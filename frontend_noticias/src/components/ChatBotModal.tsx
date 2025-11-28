import React, { useState, useRef, useEffect } from 'react';
import type { Noticia, Estadisticas } from '../types';
import { newsApi } from '../api/newsApi';
import LoadingSpinner from './LoadingSpinner';

interface ChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPlan: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBotModal: React.FC<ChatBotModalProps> = ({ isOpen, onClose, userPlan }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Preguntas predefinidas
  const preguntasPredefinidas = [
    "¿Cuántas noticias hay en total?",
    "¿Cuáles son las últimas 10 noticias?",
    "¿Qué noticias hay de deportes?",
    "¿Cuáles son las categorías disponibles?",
    "¿Qué fuentes de noticias tienes?",
    "¿Cuáles son las noticias más recientes?",
    "¿Hay noticias de tecnología?",
    "¿Cuántas noticias hay por categoría?"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensaje de bienvenida
      setMessages([{
        id: '1',
        text: '¡Hola! Soy tu asistente de noticias. ¿En qué puedo ayudarte? Puedes preguntarme sobre las noticias disponibles, categorías, fuentes, o usar las preguntas sugeridas.',
        isUser: false,
        timestamp: new Date()
      }]);
      cargarEstadisticas();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cargarEstadisticas = async () => {
    try {
      const stats = await newsApi.getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const procesarPregunta = async (pregunta: string) => {
    setIsLoading(true);
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      text: pregunta,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let respuesta = '';

      // Procesar la pregunta
      const preguntaLower = pregunta.toLowerCase();

      if (preguntaLower.includes('total') || preguntaLower.includes('cuántas') || preguntaLower.includes('cuantas')) {
        respuesta = await procesarPreguntaTotal();
      } else if (preguntaLower.includes('últimas') || preguntaLower.includes('ultimas') || preguntaLower.includes('recientes')) {
        respuesta = await procesarPreguntaUltimas();
      } else if (preguntaLower.includes('deporte')) {
        respuesta = await procesarPreguntaDeportes();
      } else if (preguntaLower.includes('tecnología') || preguntaLower.includes('tecnologia')) {
        respuesta = await procesarPreguntaTecnologia();
      } else if (preguntaLower.includes('categoría') || preguntaLower.includes('categoria')) {
        respuesta = await procesarPreguntaCategorias();
      } else if (preguntaLower.includes('fuente')) {
        respuesta = await procesarPreguntaFuentes();
      } else {
        respuesta = "Lo siento, solo puedo responder preguntas sobre las noticias disponibles. Puedes preguntarme sobre el total de noticias, categorías, fuentes, o noticias específicas por categoría.";
      }

      // Agregar respuesta del bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: respuesta,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error procesando pregunta:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const procesarPreguntaTotal = async (): Promise<string> => {
    if (!estadisticas) {
      const stats = await newsApi.getEstadisticas();
      setEstadisticas(stats);
    }

    const total = estadisticas?.total_noticias || 0;
    return `📊 Actualmente hay **${total} noticias** en la base de datos.`;
  };

  const procesarPreguntaUltimas = async (): Promise<string> => {
    try {
      const noticias = await newsApi.getNoticias(0, 10);
      
      if (noticias.length === 0) {
        return "No hay noticias recientes disponibles en este momento.";
      }

      let respuesta = "📰 **Últimas 10 noticias:**\n\n";
      noticias.forEach((noticia, index) => {
        respuesta += `${index + 1}. **${noticia.titulo}** (${noticia.fuente}) - ${new Date(noticia.fecha).toLocaleDateString('es-ES')}\n`;
      });

      return respuesta;
    } catch (error) {
      return "No pude obtener las noticias recientes en este momento.";
    }
  };

  const procesarPreguntaDeportes = async (): Promise<string> => {
    try {
      const noticias = await newsApi.getNoticiasPorCategoria('Deportes', 0, 10);
      
      if (noticias.length === 0) {
        return "No hay noticias de deportes disponibles en este momento.";
      }

      let respuesta = "⚽ **Noticias de Deportes:**\n\n";
      noticias.forEach((noticia, index) => {
        respuesta += `${index + 1}. **${noticia.titulo}** (${noticia.fuente}) - ${new Date(noticia.fecha).toLocaleDateString('es-ES')}\n`;
      });

      return respuesta;
    } catch (error) {
      return "No pude obtener las noticias de deportes en este momento.";
    }
  };

  const procesarPreguntaTecnologia = async (): Promise<string> => {
    try {
      const noticias = await newsApi.getNoticiasPorCategoria('Tecnología', 0, 10);
      
      if (noticias.length === 0) {
        return "No hay noticias de tecnología disponibles en este momento.";
      }

      let respuesta = "💻 **Noticias de Tecnología:**\n\n";
      noticias.forEach((noticia, index) => {
        respuesta += `${index + 1}. **${noticia.titulo}** (${noticia.fuente}) - ${new Date(noticia.fecha).toLocaleDateString('es-ES')}\n`;
      });

      return respuesta;
    } catch (error) {
      return "No pude obtener las noticias de tecnología en este momento.";
    }
  };

  const procesarPreguntaCategorias = async (): Promise<string> => {
    if (!estadisticas) {
      const stats = await newsApi.getEstadisticas();
      setEstadisticas(stats);
    }

    const categorias = estadisticas?.categorias || {};
    
    if (Object.keys(categorias).length === 0) {
      return "No hay categorías disponibles en este momento.";
    }

    let respuesta = "📂 **Categorías disponibles:**\n\n";
    Object.entries(categorias).forEach(([categoria, cantidad]) => {
      respuesta += `• **${categoria}**: ${cantidad} noticias\n`;
    });

    return respuesta;
  };

  const procesarPreguntaFuentes = async (): Promise<string> => {
    if (!estadisticas) {
      const stats = await newsApi.getEstadisticas();
      setEstadisticas(stats);
    }

    const fuentes = estadisticas?.fuentes || {};
    
    if (Object.keys(fuentes).length === 0) {
      return "No hay fuentes disponibles en este momento.";
    }

    let respuesta = "📰 **Fuentes de noticias:**\n\n";
    Object.entries(fuentes).forEach(([fuente, cantidad]) => {
      respuesta += `• **${fuente}**: ${cantidad} noticias\n`;
    });

    return respuesta;
  };

  const handleSendMessage = () => {
    if (inputText.trim() && !isLoading) {
      procesarPregunta(inputText.trim());
      setInputText('');
    }
  };

  const handlePreguntaPredefinida = (pregunta: string) => {
    setInputText(pregunta);
    // Pequeño delay para que se vea la pregunta en el input
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  // Si el usuario no es PLUS, mostrar mensaje de restricción
  if (userPlan !== 'plus' && userPlan !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">ChatBot de Noticias</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Función Exclusiva Plus</h4>
            <p className="text-gray-600 mb-4">
              El chatbot inteligente está disponible solo para usuarios con plan Plus.
            </p>
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Asistente de Noticias</h3>
              <p className="text-purple-100 text-sm">Basado en los datos actuales</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-purple-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preguntas rápidas */}
        <div className="p-4 border-b bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Preguntas rápidas:</h4>
          <div className="flex flex-wrap gap-2">
            {preguntasPredefinidas.map((pregunta, index) => (
              <button
                key={index}
                onClick={() => handlePreguntaPredefinida(pregunta)}
                disabled={isLoading}
                className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {pregunta}
              </button>
            ))}
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.isUser
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{message.text}</div>
                  <div className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <LoadingSpinner size="small" />
                    <span>Procesando tu pregunta...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input de mensaje */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta sobre las noticias..."
              disabled={isLoading}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotModal;