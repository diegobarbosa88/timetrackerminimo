'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth';
import { sampleTimeRecords } from '../../lib/sample-data';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// Componente de informes accesible para administradores y empleados
export default function ReportsPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('week');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('');
  
  // Referencias para exportación
  const reportRef = useRef(null);

  // Función para generar el informe
  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulamos una llamada a API con un pequeño retraso
    setTimeout(() => {
      // Generamos datos de informe basados en los filtros seleccionados
      const data = generateReportData(reportType, dateRange, employeeFilter);
      setReportData(data);
      setReportGenerated(true);
      setIsGenerating(false);
    }, 1000);
  };

  // Función para generar datos de informe basados en los filtros
  const generateReportData = (type, range, employee) => {
    // En una implementación real, esto haría una llamada a la API
    // Para esta demo, generamos datos de ejemplo basados en los filtros
    
    // Filtramos los registros de tiempo según el rango de fechas
    const now = new Date();
    let startDate = new Date();
    
    switch(range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Filtramos por empleado si es necesario
    const filteredRecords = sampleTimeRecords.filter(record => {
      const recordDate = new Date(record.date);
      const matchesDate = recordDate >= startDate && recordDate <= now;
      const matchesEmployee = employee === 'all' || record.userId === employee;
      return matchesDate && matchesEmployee;
    });
    
    // Agrupamos los registros por empleado
    const employeeRecords = {};
    filteredRecords.forEach(record => {
      if (!employeeRecords[record.userId]) {
        employeeRecords[record.userId] = [];
      }
      employeeRecords[record.userId].push(record);
    });
    
    // Generamos estadísticas según el tipo de informe
    const employees = [
      { id: 'EMP001', name: 'Carlos Rodríguez', department: 'Operaciones' },
      { id: 'EMP002', name: 'Ana Martínez', department: 'Administración' },
      { id: 'EMP003', name: 'Miguel Sánchez', department: 'Ventas' }
    ];
    
    const reportData = employees
      .filter(emp => employee === 'all' || emp.id === employee)
      .map(emp => {
        const records = employeeRecords[emp.id] || [];
        const totalDays = getWorkingDaysInRange(startDate, now);
        const workedDays = new Set(records.map(r => r.date)).size;
        const attendanceRate = totalDays > 0 ? (workedDays / totalDays) * 100 : 0;
        
        // Calculamos las horas trabajadas
        let totalMinutes = 0;
        records.forEach(record => {
          if (record.totalWorkTime) {
            totalMinutes += record.totalWorkTime;
          }
        });
        
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        // Calculamos el promedio diario
        const avgDailyMinutes = workedDays > 0 ? totalMinutes / workedDays : 0;
        const avgDailyHours = Math.floor(avgDailyMinutes / 60);
        const avgDailyRemainingMinutes = Math.floor(avgDailyMinutes % 60);
        
        // Calculamos las horas extra (más de 8 horas por día)
        let overtimeMinutes = 0;
        records.forEach(record => {
          if (record.totalWorkTime && record.totalWorkTime > 480) { // 8 horas = 480 minutos
            overtimeMinutes += (record.totalWorkTime - 480);
          }
        });
        
        const overtimeHours = Math.floor(overtimeMinutes / 60);
        const overtimeRemainingMinutes = overtimeMinutes % 60;
        
        // Calculamos las llegadas tardías
        const lateDays = records.filter(record => record.usedEntryTolerance).length;
        
        // Datos de rendimiento (simulados)
        const tasksCompleted = Math.floor(Math.random() * 10) + 15;
        const totalTasks = 25;
        const efficiency = (tasksCompleted / totalTasks) * 100;
        
        let performance;
        if (efficiency >= 90) performance = 'Excelente';
        else if (efficiency >= 80) performance = 'Bueno';
        else if (efficiency >= 70) performance = 'Regular';
        else performance = 'Necesita mejorar';
        
        return {
          id: emp.id,
          name: emp.name,
          department: emp.department,
          attendance: {
            workedDays,
            totalDays,
            attendanceRate: attendanceRate.toFixed(1),
            lateDays
          },
          hours: {
            totalHours,
            remainingMinutes,
            avgDailyHours,
            avgDailyRemainingMinutes,
            overtimeHours,
            overtimeRemainingMinutes
          },
          performance: {
            tasksCompleted,
            totalTasks,
            efficiency: efficiency.toFixed(1),
            rating: performance
          }
        };
      });
    
    return {
      type,
      range,
      employee,
      generatedAt: new Date().toISOString(),
      data: reportData
    };
  };
  
  // Función auxiliar para calcular días laborables en un rango
  const getWorkingDaysInRange = (startDate, endDate) => {
    let count = 0;
    const currentDate = new Date(startDate.getTime());
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  };
  
  // Función para descargar el informe
  const downloadReport = (format) => {
    if (!reportData) return;
    
    setIsDownloading(true);
    setDownloadFormat(format);
    
    setTimeout(() => {
      if (format === 'pdf') {
        generatePDF();
      } else if (format === 'excel') {
        generateExcel();
      } else if (format === 'csv') {
        generateCSV();
      }
      
      setIsDownloading(false);
      setDownloadFormat('');
    }, 500);
  };
  
  // Función para generar PDF usando jsPDF y html2canvas
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const reportTitle = getReportTitle();
      
      // Capturamos el contenido del informe como imagen
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Creamos el documento PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Añadimos título
      pdf.setFontSize(16);
      pdf.text(reportTitle, 15, 15);
      
      // Añadimos fecha de generación
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleString()}`, 15, 22);
      
      // Calculamos dimensiones para mantener la proporción
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Añadimos la imagen del informe
      pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      
      // Guardamos el PDF
      pdf.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Función para generar Excel usando xlsx
  const generateExcel = () => {
    try {
      const reportTitle = getReportTitle();
      
      // Preparamos los datos para Excel
      const excelData = [
        ['Informe: ' + reportTitle],
        ['Generado el: ' + new Date().toLocaleString()],
        [''],
        ['Empleado', 'Departamento', ...getHeadersByReportType()]
      ];
      
      // Añadimos los datos de cada empleado
      reportData.data.forEach(employee => {
        const rowData = [
          employee.name,
          employee.department,
          ...getEmployeeDataByReportType(employee)
        ];
        excelData.push(rowData);
      });
      
      // Creamos el libro y la hoja
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Añadimos la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Informe');
      
      // Guardamos el archivo
      XLSX.writeFile(wb, `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Hubo un error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Función para generar CSV
  const generateCSV = () => {
    try {
      const reportTitle = getReportTitle();
      
      // Preparamos los datos para CSV
      let csvContent = 'Empleado,Departamento,' + getHeadersByReportType().join(',') + '\n';
      
      // Añadimos los datos de cada empleado
      reportData.data.forEach(employee => {
        csvContent += `"${employee.name}","${employee.department}",` + 
          getEmployeeDataByReportType(employee).map(d => `"${d}"`).join(',') + '\n';
      });
      
      // Creamos el blob y lo descargamos
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar CSV:', error);
      alert('Hubo un error al generar el archivo CSV. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Función auxiliar para obtener el título del informe
  const getReportTitle = () => {
    const typeText = 
      reportType === 'attendance' ? 'Informe de Asistencia' :
      reportType === 'hours' ? 'Informe de Horas Trabajadas' :
      'Informe de Rendimiento';
    
    const rangeText = 
      dateRange === 'week' ? 'Esta Semana' :
      dateRange === 'month' ? 'Este Mes' :
      dateRange === 'quarter' ? 'Este Trimestre' :
      'Este Año';
    
    return `${typeText} - ${rangeText}`;
  };
  
  // Función auxiliar para obtener encabezados según tipo de informe
  const getHeadersByReportType = () => {
    if (reportType === 'attendance') {
      return ['Días Trabajados', 'Asistencia (%)', 'Llegadas Tarde'];
    } else if (reportType === 'hours') {
      return ['Horas Totales', 'Promedio Diario', 'Horas Extra'];
    } else if (reportType === 'performance') {
      return ['Tareas Completadas', 'Eficiencia (%)', 'Valoración'];
    }
    return [];
  };
  
  // Función auxiliar para obtener datos de empleado según tipo de informe
  const getEmployeeDataByReportType = (employee) => {
    if (reportType === 'attendance') {
      return [
        `${employee.attendance.workedDays}/${employee.attendance.totalDays}`,
        `${employee.attendance.attendanceRate}%`,
        employee.attendance.lateDays
      ];
    } else if (reportType === 'hours') {
      return [
        `${employee.hours.totalHours}h ${employee.hours.remainingMinutes}m`,
        `${employee.hours.avgDailyHours}h ${employee.hours.avgDailyRemainingMinutes}m`,
        `${employee.hours.overtimeHours}h ${employee.hours.overtimeRemainingMinutes}m`
      ];
    } else if (reportType === 'performance') {
      return [
        `${employee.performance.tasksCompleted}/${employee.performance.totalTasks}`,
        `${employee.performance.efficiency}%`,
        employee.performance.rating
      ];
    }
    return [];
  };

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
              disabled={isGenerating}
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
              disabled={isGenerating}
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
              disabled={isGenerating}
            >
              <option value="all">Todos los Empleados</option>
              <option value="EMP001">Carlos Rodríguez</option>
              <option value="EMP002">Ana Martínez</option>
              <option value="EMP003">Miguel Sánchez</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="btn-primary flex items-center"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando Informe...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Generar Informe
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Visualización del informe */}
      {reportGenerated && reportData && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8" ref={reportRef}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {reportType === 'attendance' ? 'Informe de Asistencia' :
               reportType === 'hours' ? 'Informe de Horas Trabajadas' :
               'Informe de Rendimiento'} - 
              {dateRange === 'week' ? ' Esta Semana' :
               dateRange === 'month' ? ' Este Mes' :
               dateRange === 'quarter' ? ' Este Trimestre' :
               ' Este Año'}
            </h2>
            <span className="text-sm text-gray-500">
              Generado el: {new Date(reportData.generatedAt).toLocaleString()}
            </span>
          </div>
          
          {/* Visualización gráfica */}
          {reportType === 'attendance' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Resumen de Asistencia</h3>
              <div className="flex flex-wrap justify-around">
                {reportData.data.map(employee => (
                  <div key={employee.id} className="w-full md:w-1/3 p-2">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-center mb-2">{employee.name}</div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                              Asistencia
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              {employee.attendance.attendanceRate}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div style={{ width: `${employee.attendance.attendanceRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {reportType === 'hours' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Distribución de Horas</h3>
              <div className="flex flex-wrap justify-around">
                {reportData.data.map(employee => (
                  <div key={employee.id} className="w-full md:w-1/3 p-2">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-center mb-2">{employee.name}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {employee.hours.totalHours}h
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {employee.hours.avgDailyHours}h
                          </div>
                          <div className="text-xs text-gray-500">Promedio</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {employee.hours.overtimeHours}h
                          </div>
                          <div className="text-xs text-gray-500">Extra</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {reportType === 'performance' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Rendimiento</h3>
              <div className="flex flex-wrap justify-around">
                {reportData.data.map(employee => (
                  <div key={employee.id} className="w-full md:w-1/3 p-2">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-center mb-2">{employee.name}</div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                              Eficiencia
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-green-600">
                              {employee.performance.efficiency}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                          <div style={{ width: `${employee.performance.efficiency}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                        </div>
                        <div className="text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.performance.rating === 'Excelente' ? 'bg-green-100 text-green-800' :
                            employee.performance.rating === 'Bueno' ? 'bg-blue-100 text-blue-800' :
                            employee.performance.rating === 'Regular' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {employee.performance.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
                {reportData.data.map(employee => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                    {reportType === 'attendance' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.attendance.workedDays}/{employee.attendance.totalDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.attendance.attendanceRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.attendance.lateDays}</td>
                      </>
                    )}
                    {reportType === 'hours' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.hours.totalHours}h {employee.hours.remainingMinutes}m</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.hours.avgDailyHours}h {employee.hours.avgDailyRemainingMinutes}m</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.hours.overtimeHours}h {employee.hours.overtimeRemainingMinutes}m</td>
                      </>
                    )}
                    {reportType === 'performance' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.performance.tasksCompleted}/{employee.performance.totalTasks}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.performance.efficiency}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.performance.rating === 'Excelente' ? 'bg-green-100 text-green-800' :
                            employee.performance.rating === 'Bueno' ? 'bg-blue-100 text-blue-800' :
                            employee.performance.rating === 'Regular' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {employee.performance.rating}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              className={`btn-secondary mr-2 flex items-center ${isDownloading && downloadFormat === 'pdf' ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => downloadReport('pdf')}
              disabled={isDownloading}
            >
              {isDownloading && downloadFormat === 'pdf' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Descargando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Exportar PDF
                </>
              )}
            </button>
            
            <button 
              className={`btn-secondary mr-2 flex items-center ${isDownloading && downloadFormat === 'excel' ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => downloadReport('excel')}
              disabled={isDownloading}
            >
              {isDownloading && downloadFormat === 'excel' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Descargando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 5a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 5a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3z" clipRule="evenodd" />
                  </svg>
                  Exportar Excel
                </>
              )}
            </button>
            
            <button 
              className={`btn-secondary flex items-center ${isDownloading && downloadFormat === 'csv' ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => downloadReport('csv')}
              disabled={isDownloading}
            >
              {isDownloading && downloadFormat === 'csv' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Descargando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1H3V4zm0 3a1 1 0 011-1h12a1 1 0 011 1v1H3V7zm0 3a1 1 0 011-1h12a1 1 0 011 1v1H3v-1zm0 3a1 1 0 011-1h12a1 1 0 011 1v1H3v-1z" clipRule="evenodd" />
                  </svg>
                  Exportar CSV
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Mensaje cuando no hay informe generado */}
      {!reportGenerated && (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay informes generados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecciona los filtros y haz clic en "Generar Informe" para visualizar los datos.
          </p>
        </div>
      )}
    </div>
  );
}
