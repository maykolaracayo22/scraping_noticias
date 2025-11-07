import React from 'react';

interface SourceFilterProps {
  fuentes: string[];
  fuenteSeleccionada: string;
  onFuenteChange: (fuente: string) => void;
}

const SourceFilter: React.FC<SourceFilterProps> = ({
  fuentes,
  fuenteSeleccionada,
  onFuenteChange
}) => {
  // Asegurarnos de que las fuentes sean consistentes con el backend
  const fuentesNormalizadas = fuentes.map(fuente => {
    // Normalizar los nombres para que coincidan con lo que viene del backend
    const normalizada = fuente
      .replace('_', ' ') // Reemplazar guiones bajos por espacios
      .split(' ') // Separar por espacios
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()) // Capitalizar cada palabra
      .join(' ');
    
    return normalizada;
  });

  // Eliminar duplicados después de normalizar
  const fuentesUnicas = Array.from(new Set(fuentesNormalizadas));

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onFuenteChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          fuenteSeleccionada === '' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Todas
      </button>
      {fuentesUnicas.map((fuente) => (
        <button
          key={fuente}
          onClick={() => onFuenteChange(fuente)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            fuenteSeleccionada === fuente 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {fuente}
        </button>
      ))}
    </div>
  );
};

export default SourceFilter;