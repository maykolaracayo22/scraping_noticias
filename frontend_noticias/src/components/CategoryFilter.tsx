import React from 'react';

interface CategoryFilterProps {
  categorias: string[];
  categoriaSeleccionada: string;
  onCategoriaChange: (categoria: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categorias,
  categoriaSeleccionada,
  onCategoriaChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onCategoriaChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          categoriaSeleccionada === '' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Todas
      </button>
      {categorias.map((categoria) => (
        <button
          key={categoria}
          onClick={() => onCategoriaChange(categoria)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            categoriaSeleccionada === categoria 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {categoria}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;