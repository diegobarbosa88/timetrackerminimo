'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { sampleTimeRecords, getUniqueClients } from '../../lib/sample-data';
import { TimeRecord } from '../../lib/time-tracking-models';

export default function ReportsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: '2024-04-01',
    endDate: '2024-04-30'
  });
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [isGenerating, setIsGenerating] = useState(false);

  // Datos de ejemplo para los empleados
  const sampleEmployees = [
    { id: 'EMP001', name: 'Carlos Rodríguez' },
    { id: 'EMP002', name: 'Ana Martínez' },
    { id: 'EMP003', name: 'Miguel Sánchez' },
    { id: 'EMP004', name: 'Laura Gómez' },
    { id: 'EMP005', name: 'Javier López' }
  ];

  // Obtener clientes únicos
  const clients = getUniqueClients();

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handleEmployeeFilterChange = (e) => {
    setEmployeeFilter(e.target.value);
  };

  const handleClientFilterChange = (e) => {
    setClientFilter(e.target.value);
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const generateReport = () => {
    setIsGenerating(true);

    // Simulación de generación de informe
    setTimeout(() => {
      // Filtrar registros según los criterios seleccionados
      let filteredRecords = [...sampleTimeRecords];

      if (employeeFilter) {
        filteredRecords = filteredRecords.filter(record => record.userId === employeeFilter);
      }

      if (clientFilter) {
        filteredRecords = filteredRecords.filter(record => record.clientTag === clientFilter);
      }

      // Filtrar por rango de fechas
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return recordDate >= startDate && recordDate <= endDate;
      });

      // Generar datos para el informe según el tipo seleccionado
      let reportData;
      if (reportType === 'daily') {
        // Agrupar por fecha
        const groupedByDate = filteredRecords.reduce((acc, record) => {
          if (!acc[record.date]) {
            acc[record.date] = [];
          }
          acc[record.date].push(record);
          return acc;
        }, {});

        // Calcular horas totales por fecha
        reportData = Object.keys(groupedByDate).map(date => {
          const records = groupedByDate[date];
          const totalMinutes = records.reduce((sum, record) => sum + (record.totalWorkTime || 0), 0);
          return {
            date,
            totalHours: (totalMinutes / 60).toFixed(2),
            recordCount: records.length
          };
        });

        // Ordenar por fecha
        reportData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (reportType === 'employee') {
        // Agrupar por empleado
        const groupedByEmployee = filteredRecords.reduce((acc, record) => {
          if (!acc[record.userId]) {
            acc[record.userId] = [];
          }
          acc[record.userId].push(record);
          return acc;
        }, {});

        // Calcular horas totales por empleado
        reportData = Object.keys(groupedByEmployee).map(userId => {
          const records = groupedByEmployee[userId];
          const totalMinutes = records.reduce((sum, record) => sum + (record.totalWorkTime || 0), 0);
          const employee = sampleEmployees.find(emp => emp.id === userId);
          return {
            employeeId: userId,
            employeeName: employee ? employee.name : 'Desconocido',
            totalHours: (totalMinutes / 60).toFixed(2),
            recordCount: records.length
          };
        });

        // Ordenar por horas totales (descendente)
        reportData.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));
      } else if (reportType === 'client') {
        // Agrupar por cliente
        const groupedByClient = filteredRecords.reduce((acc, record) => {
          const clientTag = record.clientTag || 'Sin cliente';
          if (!acc[clientTag]) {
            acc[clientTag] = [];
          }
          acc[clientTag].push(record);
          return acc;
        }, {});

        // Calcular horas totales por cliente
        reportData = Object.keys(groupedByClient).map(clientTag => {
          const records = groupedByClient[clientTag];
          const totalMinutes = records.reduce((sum, record) => sum + (record.totalWorkTime || 0), 0);
          return {
            clientTag,
            totalHours: (totalMinutes / 60).toFixed(2),
            recordCount: records.length
          };
        });

        // Ordenar por horas totales (descendente)
        reportData.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));
      }

      // Generar el informe
      setGeneratedReport({
        type: reportType,
        dateRange: { ...dateRange },
        data: reportData,
        totalRecords: filteredRecords.length,
        totalHours: (filteredRecords.reduce((sum, record) => sum + (record.totalWorkTime || 0), 0) / 60).toFixed(2),
        generatedAt: new Date().toISOString()
      });

      setIsGenerating(false);
    }, 1500); // Simular tiempo de generación
  };

  const handleExportReport = (format) => {
    if (!generatedReport) return;

    // Simulación de exportación
    alert(`Informe exportado en formato ${format}`);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    } as Intl.DateTimeFormatOptions;
    
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Informes y Estadísticas</h1>

        {/* Filtros y opciones de informe */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generar Informe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Informe
              </label>
              <select
                id="reportType"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={reportType}
                onChange={handleReportTypeChange}
              >
                <option value="daily">Informe Diario</option>
                <option value="employee">Informe por Empleado</option>
                <option value="client">Informe por Cliente</option>
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
              />
            </div>
            <div>
              <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Empleado
              </label>
              <select
                id="employeeFilter"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={employeeFilter}
                onChange={handleEmployeeFilterChange}
              >
                <option value="">Todos los empleados</option>
                {sampleEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                id="clientFilter"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={clientFilter}
                onChange={handleClientFilterChange}
              >
                <option value="">Todos los clientes</option>
                {clients.map((client, index) => (
                  <option key={index} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Gráfico
              </label>
              <select
                id="chartType"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={chartType}
                onChange={handleChartTypeChange}
              >
                <option value="bar">Gráfico de Barras</option>
                <option value="line">Gráfico de Líneas</option>
                <option value="pie">Gráfico Circular</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? 'Generando...' : 'Generar Informe'}
            </button>
          </div>
        </div>

        {/* Resultados del informe */}
        {generatedReport && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {reportType === 'daily'
                    ? 'Informe Diario'
                    : reportType === 'employee'
                    ? 'Informe por Empleado'
                    : 'Informe por Cliente'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExportReport('pdf')}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => handleExportReport('csv')}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Exportar CSV
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Período</p>
                  <p className="font-medium">
                    {formatDate(generatedReport.dateRange.startDate)} - {formatDate(generatedReport.dateRange.endDate)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total de Registros</p>
                  <p className="font-medium">{generatedReport.totalRecords}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total de Horas</p>
                  <p className="font-medium">{generatedReport.totalHours} horas</p>
                </div>
              </div>

              {/* Gráfico (simulado) */}
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-gray-500">
                    [Aquí se mostraría un gráfico {chartType === 'bar' ? 'de barras' : chartType === 'line' ? 'de líneas' : 'circular'}]
                  </p>
                </div>
              </div>

              {/* Tabla de datos */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {reportType === 'daily' && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Horas
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registros
                          </th>
                        </>
                      )}
                      {reportType === 'employee' && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Empleado
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Horas
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registros
                          </th>
                        </>
                      )}
                      {reportType === 'client' && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Horas
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registros
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedReport.data.map((item, index) => (
                      <tr key={index}>
                        {reportType === 'daily' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.totalHours} h
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.recordCount}
                            </td>
                          </>
                        )}
                        {reportType === 'employee' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.employeeName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.totalHours} h
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.recordCount}
                            </td>
                          </>
                        )}
                        {reportType === 'client' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.clientTag}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.totalHours} h
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.recordCount}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
