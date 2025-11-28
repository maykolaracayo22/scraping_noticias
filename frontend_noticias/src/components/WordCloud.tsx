import React, { useState, useMemo } from 'react';

interface WordCloudProps {
  words: Array<{
    palabra: string;
    cantidad: number;
  }>;
  maxWords?: number;
}

interface Position {
  x: number;
  y: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ words, maxWords = 30 }) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState<'warm' | 'cool' | 'sunset' | 'nature'>('warm');

  // Esquemas de color mejorados
  const colorSchemes = {
    warm: ['#FF6B6B', '#FF9E7D', '#FFCA7B', '#FFE29A', '#4ECDC4', '#FF857B'],
    cool: ['#6A89CC', '#82CCDD', '#B8E994', '#F6B93B', '#E55039', '#78E08F'],
    sunset: ['#FD746C', '#FF9068', '#FFAF68', '#FFD868', '#2C3E50', '#FEA47F'],
    nature: ['#00B894', '#00CEC9', '#81ECEC', '#FDCB6E', '#FFA502', '#55E6C1']
  };

  // Filtrar y limitar palabras
  const filteredWords = useMemo(() => {
    return words
      .filter(word => word.palabra && word.palabra.trim().length > 0)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, maxWords);
  }, [words, maxWords]);

  // Calcular tamaños y opacidades
  const wordsWithStyles = useMemo(() => {
    if (filteredWords.length === 0) return [];

    const counts = filteredWords.map(word => word.cantidad);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    return filteredWords.map((word, index) => {
      // Tamaño escalado
      const minSize = 16;
      const maxSize = 72;
      const fontSize = maxCount === minCount 
        ? (minSize + maxSize) / 2
        : minSize + ((word.cantidad - minCount) / (maxCount - minCount)) * (maxSize - minSize);

      // Opacidad escalada
      const opacity = 0.7 + ((word.cantidad - minCount) / (maxCount - minCount)) * 0.3;

      // Color basado en el esquema seleccionado
      const colors = colorSchemes[colorScheme];
      const color = colors[index % colors.length];

      // Peso de la fuente
      const fontWeight = word.cantidad > (minCount + maxCount) / 2 ? 'bold' : 'semibold';

      // Rotación aleatoria pero controlada
      const rotation = (index % 5) - 2; // Rotaciones entre -2 y 2 grados

      return {
        ...word,
        fontSize,
        opacity,
        color,
        fontWeight,
        rotation
      };
    });
  }, [filteredWords, colorScheme]);

  // Posicionamiento más inteligente para evitar superposiciones
  const calculatePositions = useMemo(() => {
    const positions: Position[] = [];
    const containerWidth = 800;
    const containerHeight = 500;
    
    wordsWithStyles.forEach((word, index) => {
      let attempts = 0;
      let position: Position;
      
      do {
        // Distribución en espiral para mejor disposición
        const angle = (index * 137.5) * (Math.PI / 180); // Ángulo áureo
        const radius =  Math.min(containerWidth, containerHeight) * 0.4 * (index / wordsWithStyles.length);
        
        position = {
          x: containerWidth / 2 + radius * Math.cos(angle),
          y: containerHeight / 2 + radius * Math.sin(angle)
        };
        
        attempts++;
        
        // Si hay demasiados intentos, usar posición aleatoria
        if (attempts > 10) {
          position = {
            x: Math.random() * containerWidth * 0.8 + containerWidth * 0.1,
            y: Math.random() * containerHeight * 0.8 + containerHeight * 0.1
          };
        }
      } while (
        positions.some(pos => 
          Math.abs(pos.x - position.x) < word.fontSize * 0.8 && 
          Math.abs(pos.y - position.y) < word.fontSize * 0.8
        ) && attempts < 20
      );
      
      positions.push(position);
    });
    
    return positions;
  }, [wordsWithStyles]);

  if (filteredWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <div className="text-4xl mb-4">☁️</div>
        <div className="text-gray-400 text-lg font-medium">No hay datos para mostrar</div>
        <div className="text-gray-300 text-sm mt-2">Agrega palabras para ver la nube</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Controles */}
      <div className="flex flex-wrap gap-4 justify-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Colores:</span>
          {(['warm', 'cool', 'sunset', 'nature'] as const).map(scheme => (
            <button
              key={scheme}
              onClick={() => setColorScheme(scheme)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                colorScheme === scheme ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ 
                background: `linear-gradient(135deg, ${colorSchemes[scheme][0]}, ${colorSchemes[scheme][2]})` 
              }}
              title={`Esquema ${scheme}`}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>💡</span>
          <span>Haz hover o click en las palabras</span>
        </div>
      </div>

      {/* Nube de palabras */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div 
          className="relative flex flex-wrap justify-center items-center p-8 min-h-96"
          style={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}
        >
          {wordsWithStyles.map((word, index) => {
            const position = calculatePositions[index];
            
            return (
              <button
                key={word.palabra}
                className="absolute transition-all duration-500 ease-out cursor-pointer hover:z-10"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform: `translate(-50%, -50%) rotate(${word.rotation}deg) ${
                    hoveredWord === word.palabra ? 'scale(1.3) rotate(0deg)' : 'scale(1)'
                  }`,
                  fontSize: `${word.fontSize}px`,
                  color: word.color,
                  opacity: hoveredWord === word.palabra || hoveredWord === null ? word.opacity : 0.3,
                  fontWeight: word.fontWeight,
                  filter: hoveredWord === word.palabra ? 'drop-shadow(0 8px 15px rgba(0,0,0,0.2))' : 'none',
                  zIndex: hoveredWord === word.palabra ? 50 : 1,
                }}
                onMouseEnter={() => setHoveredWord(word.palabra)}
                onMouseLeave={() => setHoveredWord(null)}
                onClick={() => {
                  // Efecto de click - podrías agregar más funcionalidad aquí
                  setHoveredWord(word.palabra);
                  setTimeout(() => setHoveredWord(null), 1000);
                }}
                title={`"${word.palabra}" - ${word.cantidad} apariciones`}
              >
                <span className="relative">
                  {word.palabra}
                  {hoveredWord === word.palabra && (
                    <span 
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ fontSize: '12px' }}
                    >
                      {word.cantidad} apariciones
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="font-medium">Total de palabras: {filteredWords.length}</span>
              <span>•</span>
              <span>Tamaño = Frecuencia</span>
            </div>
            <div className="text-gray-400">
              Más grande = Más frecuente
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Interactúa con las palabras para ver detalles. Los colores y tamaños representan la frecuencia de uso.</p>
      </div>
    </div>
  );
};

export default WordCloud;