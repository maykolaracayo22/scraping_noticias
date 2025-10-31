import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type{ Estadisticas } from '../types';

interface StatsDashboardProps {
  estadisticas: Estadisticas;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const StatsDashboard: React.FC<StatsDashboardProps> = ({ estadisticas }) => {
  const datosCategorias = Object.entries(estadisticas.categorias).map(([name, value]) => ({
    name,
    value
  }));

  const datosFuentes = Object.entries(estadisticas.fuentes).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard de Estadísticas</h2>
      
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Noticias</h3>
          <p className="text-3xl font-bold text-blue-600">{estadisticas.total_noticias}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Categorías</h3>
          <p className="text-3xl font-bold text-green-600">{Object.keys(estadisticas.categorias).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Fuentes</h3>
          <p className="text-3xl font-bold text-purple-600">{Object.keys(estadisticas.fuentes).length}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de barras - Categorías */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Noticias por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosCategorias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de torta - Fuentes */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Distribución por Fuente</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosFuentes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {datosFuentes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Última actualización */}
      {estadisticas.ultima_actualizacion && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Última actualización: {new Date(estadisticas.ultima_actualizacion).toLocaleString('es-ES')}
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;