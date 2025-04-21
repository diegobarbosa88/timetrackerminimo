'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, withAuth } from '../../lib/auth';

// Componente de informes accesible para administradores y empleados
function ReportsPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = React.useState('attendance');
  const [dateRange, setDateRange] = React.useState('week');
  const [employeeFilter, setEmployeeFilter] = React.useState('all');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Informes</h1>
      
      {/* Filtros de informes */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Informe</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="attendance">Asistencia</option>
              <option value="hours">Horas Trabajadas</option>
              <option value="performance">Rendimiento</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Fechas</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los Empleados</option>
              <option value="EMP001">Carlos Rodríguez</option>
              <option value="EMP002">Ana Martínez</option>
              <option value="EMP003">Miguel Sánchez</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="btn-primary">
            Generar Informe
          </button>
        </div>
      </div>
      
      {/* Contenido del informe */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {reportType === 'attendance' && 'Informe de Asistencia'}
          {reportType === 'hours' && 'Informe de Horas Trabajadas'}
          {reportType === 'performance' && 'Informe de Rendimiento'}
          {' - '}
          {dateRange === 'week' && 'Esta Semana'}
          {dateRange === 'month' && 'Este Mes'}
          {dateRange === 'quarter' && 'Este Trimestre'}
          {dateRange === 'year' && 'Este Año'}
        </h2>
        
        {/* Tabla de datos del informe */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                {reportType === 'attendance' && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Trabajados</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Llegadas Tarde</th>
                  </>
                )}
                {reportType === 'hours' && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas Totales</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio Diario</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas Extra</th>
                  </>
                )}
                {reportType === 'performance' && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tareas Completadas</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eficiencia</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valoración</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(employeeFilter === 'all' || employeeFilter === 'EMP001') && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Carlos Rodríguez</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Operaciones</td>
                  {reportType === 'attendance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18/20</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">90%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                    </>
                  )}
                  {reportType === 'hours' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">168h 30m</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8h 25m</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12h 45m</td>
                    </>
                  )}
                  {reportType === 'performance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24/25</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">96%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Excelente
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              )}
              
              {(employeeFilter === 'all' || employeeFilter === 'EMP002') && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ana Martínez</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Administración</td>
                  {reportType === 'attendance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">20/20</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                    </>
                  )}
                  {reportType === 'hours' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">160h 00m</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8h 00m</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0h 00m</td>
                    </>
                  )}
                  {reportType === 'performance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">22/25</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">88%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Bueno
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              )}
              
              {(employeeFilter === 'all' || employeeFilter === 'EMP003') && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Miguel Sánchez</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ventas</td>
                  {reportType === 'attendance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15/20</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">75%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
                    </>
                  )}
                  {reportType === 'hours' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">135h 15m</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9h 01m</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15h 15m</td>
                    </>
                  )}
                  {reportType === 'performance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18/25</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">72%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Regular
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="btn-secondary mr-2">
            Exportar PDF
          </button>
          <button className="btn-secondary">
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}

// Exportar el componente con protección de autenticación (cualquier rol puede acceder)
export default withAuth(ReportsPage, 'any');
