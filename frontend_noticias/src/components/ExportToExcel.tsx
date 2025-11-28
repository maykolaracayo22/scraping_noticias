import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { newsApi } from '../api/newsApi';
import type { Noticia } from '../types';

interface ExportToExcelProps {
  className?: string;
}

interface ExportOptions {
  tipoExport: 'ultimas_20' | 'por_categoria' | 'por_fuente' | 'personalizado' | 'todas';
  categoria?: string;
  fuente?: string;
  limite?: number;
  buscarTexto?: string;
}

const ExportToExcel: React.FC<ExportToExcelProps> = ({ className = '' }) => {
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [fuentes, setFuentes] = useState<string[]>([]);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    tipoExport: 'todas'
  });

  useEffect(() => {
    cargarOpcionesExportacion();
  }, []);

  const cargarOpcionesExportacion = async () => {
    try {
      const opciones = await newsApi.getOpcionesExportacion();
      setCategorias(opciones.categorias);
      setFuentes(opciones.fuentes);
    } catch (error) {
      console.error('Error cargando opciones de exportación:', error);
    }
  };

  const obtenerNoticiasFiltradas = async (options: ExportOptions): Promise<Noticia[]> => {
    switch (options.tipoExport) {
      case 'ultimas_20':
        return await obtenerUltimasNoticias(20);
      
      case 'por_categoria':
        return await obtenerNoticiasPorFiltro('categoria', options.categoria!);
      
      case 'por_fuente':
        return await obtenerNoticiasPorFiltro('fuente', options.fuente!);
      
      case 'personalizado':
        return await obtenerNoticiasPersonalizadas(options);
      
      case 'todas':
      default:
        return await obtenerTodasLasNoticias();
    }
  };

  const obtenerUltimasNoticias = async (limite: number): Promise<Noticia[]> => {
    const todasNoticias: Noticia[] = [];
    const limitePorPagina = Math.min(limite, 500);
    let skip = 0;
    let totalObtenido = 0;

    while (totalObtenido < limite) {
      const noticiasPagina = await newsApi.getNoticias(skip, limitePorPagina);
      
      if (noticiasPagina.length === 0) break;
      
      const espacioRestante = limite - totalObtenido;
      const noticiasParaAgregar = noticiasPagina.slice(0, espacioRestante);
      
      todasNoticias.push(...noticiasParaAgregar);
      totalObtenido += noticiasParaAgregar.length;
      skip += limitePorPagina;

      if (noticiasParaAgregar.length < noticiasPagina.length) break;
    }

    return todasNoticias;
  };

  const obtenerNoticiasPorFiltro = async (tipo: 'categoria' | 'fuente', valor: string): Promise<Noticia[]> => {
    const todasNoticias: Noticia[] = [];
    const limitePorPagina = 500;
    let skip = 0;
    let hayMasNoticias = true;

    while (hayMasNoticias) {
      let noticiasPagina: Noticia[];
      
      if (tipo === 'categoria') {
        noticiasPagina = await newsApi.getNoticiasPorCategoria(valor, skip, limitePorPagina);
      } else {
        noticiasPagina = await newsApi.getNoticias(skip, limitePorPagina, valor);
      }
      
      if (noticiasPagina.length === 0) {
        hayMasNoticias = false;
      } else {
        todasNoticias.push(...noticiasPagina);
        skip += limitePorPagina;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (todasNoticias.length > 10000) {
        console.warn('Límite de 10000 noticias alcanzado');
        break;
      }
    }

    return todasNoticias;
  };

  const obtenerNoticiasPersonalizadas = async (options: ExportOptions): Promise<Noticia[]> => {
    // Para filtros personalizados, obtenemos todas y filtramos en el frontend
    const todasNoticias = await obtenerTodasLasNoticias();
    
    return todasNoticias.filter(noticia => {
      if (options.categoria && noticia.categoria !== options.categoria) return false;
      if (options.fuente && noticia.fuente !== options.fuente) return false;
      if (options.buscarTexto) {
        const textoBusqueda = options.buscarTexto.toLowerCase();
        const titulo = noticia.titulo.toLowerCase();
        const contenido = noticia.contenido?.toLowerCase() || '';
        if (!titulo.includes(textoBusqueda) && !contenido.includes(textoBusqueda)) return false;
      }
      return true;
    });
  };

  const obtenerTodasLasNoticias = async (): Promise<Noticia[]> => {
    const todasNoticias: Noticia[] = [];
    const limitePorPagina = 500;
    let skip = 0;
    let hayMasNoticias = true;

    while (hayMasNoticias) {
      const noticiasPagina = await newsApi.getNoticias(skip, limitePorPagina);
      
      if (noticiasPagina.length === 0) {
        hayMasNoticias = false;
      } else {
        todasNoticias.push(...noticiasPagina);
        skip += limitePorPagina;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (todasNoticias.length > 10000) {
        console.warn('Límite de 10000 noticias alcanzado');
        break;
      }
    }

    return todasNoticias;
  };

  const exportToExcel = async (options: ExportOptions) => {
    setExporting(true);
    try {
      const noticias = await obtenerNoticiasFiltradas(options);

      if (noticias.length === 0) {
        alert('No hay datos para exportar con los filtros seleccionados');
        return;
      }

      // Preparar datos para Excel
      const datosParaExcel = noticias.map(noticia => ({
        'ID': noticia.id,
        'Título': noticia.titulo,
        'Contenido': noticia.contenido || '',
        'Categoría': noticia.categoria,
        'Fuente': noticia.fuente,
        'Fecha Publicación': new Date(noticia.fecha).toLocaleDateString('es-ES'),
        'Fecha Creación': new Date(noticia.fecha_creacion).toLocaleDateString('es-ES'),
        'Enlace': noticia.enlace,
        'Imagen URL': noticia.imagen_url || 'Sin imagen'
      }));

      // Crear libro de trabajo de Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 8 },   // ID
        { wch: 60 },  // Título
        { wch: 100 }, // Contenido
        { wch: 15 },  // Categoría
        { wch: 20 },  // Fuente
        { wch: 15 },  // Fecha Publicación
        { wch: 15 },  // Fecha Creación
        { wch: 40 },  // Enlace
        { wch: 40 }   // Imagen URL
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Noticias');

      // Generar el archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Generar nombre de archivo según el tipo de exportación
      const timestamp = new Date().toISOString().split('T')[0];
      let filename = `noticias_${timestamp}.xlsx`;
      
      if (options.tipoExport === 'ultimas_20') {
        filename = `ultimas_20_noticias_${timestamp}.xlsx`;
      } else if (options.tipoExport === 'por_categoria') {
        filename = `noticias_${options.categoria}_${timestamp}.xlsx`;
      } else if (options.tipoExport === 'por_fuente') {
        filename = `noticias_${options.fuente}_${timestamp}.xlsx`;
      } else if (options.tipoExport === 'personalizado') {
        filename = `noticias_personalizadas_${timestamp}.xlsx`;
      }

      // Descargar el archivo
      saveAs(data, filename);
      
      alert(`✅ ${noticias.length} noticias exportadas correctamente`);
      setShowModal(false);
      
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('❌ Error al exportar los datos. Verifica la consola para más detalles.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportClick = () => {
    setShowModal(true);
  };

  const handleConfirmExport = () => {
    exportToExcel(exportOptions);
  };

  const resetOptions = () => {
    setExportOptions({
      tipoExport: 'todas'
    });
  };

  return (
    <>
      <button
        onClick={handleExportClick}
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Exportar a Excel</span>
      </button>

      {/* Modal de Opciones de Exportación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Opciones de Exportación</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tipo de Exportación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de exportación:
                </label>
                <select
                  value={exportOptions.tipoExport}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    tipoExport: e.target.value as ExportOptions['tipoExport']
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="todas">Todas las noticias</option>
                  <option value="ultimas_20">Últimas 20 noticias</option>
                  <option value="por_categoria">Por categoría</option>
                  <option value="por_fuente">Por fuente</option>
                  <option value="personalizado">Búsqueda personalizada</option>
                </select>
              </div>

              {/* Filtro por Categoría */}
              {exportOptions.tipoExport === 'por_categoria' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar categoría:
                  </label>
                  <select
                    value={exportOptions.categoria || ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      categoria: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro por Fuente */}
              {exportOptions.tipoExport === 'por_fuente' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar fuente:
                  </label>
                  <select
                    value={exportOptions.fuente || ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      fuente: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecciona una fuente</option>
                    {fuentes.map(fuente => (
                      <option key={fuente} value={fuente}>
                        {fuente}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Búsqueda Personalizada */}
              {exportOptions.tipoExport === 'personalizado' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría (opcional):
                    </label>
                    <select
                      value={exportOptions.categoria || ''}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        categoria: e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuente (opcional):
                    </label>
                    <select
                      value={exportOptions.fuente || ''}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        fuente: e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Todas las fuentes</option>
                      {fuentes.map(fuente => (
                        <option key={fuente} value={fuente}>
                          {fuente}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar texto (opcional):
                    </label>
                    <input
                      type="text"
                      value={exportOptions.buscarTexto || ''}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        buscarTexto: e.target.value
                      })}
                      placeholder="Buscar en título o contenido..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <button
                onClick={resetOptions}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Restablecer
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleConfirmExport}
                  disabled={exporting || 
                    (exportOptions.tipoExport === 'por_categoria' && !exportOptions.categoria) ||
                    (exportOptions.tipoExport === 'por_fuente' && !exportOptions.fuente)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exportando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Exportar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportToExcel;