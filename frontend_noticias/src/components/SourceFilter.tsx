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
      {fuentes.map((fuente) => (
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