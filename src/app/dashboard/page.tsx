'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { sampleTimeRecords } from '../../lib/sample-data';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalHoursThisMonth: 0,
    averageHoursPerDay: 0,
    attendanceRate: 0,
    lateArrivalRate: 0,
    departmentDistribution: [],
    recentActivity: [],
    hoursPerDay: [],
    topEmployees: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  // Datos de ejemplo para los empleados
  const sampleEmployees = [
    {
      id: 'EMP001',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@magneticplace.com',
      phone: '+34 612 345 678',
      department: 'Desarrollo',
      position: 'Desarrollador Senior',
      status: 'Activo',
      joinDate: '2022-03-15',
      location: 'Madrid',
      tags: ['Proyecto A', 'Frontend']
    },
    {
      id: 'EMP002',
      name: 'Ana Martínez',
      email: 'ana.martinez@magneticplace.com',
      phone: '+34 623 456 789',
      department: 'Diseño',
      position: 'Diseñadora UX/UI',
      status: 'Activo',
      joinDate: '2022-05-20',
      location: 'Barcelona',
      tags: ['Proyecto B', 'Diseño']
    },
    {
      id: 'EMP003',
      name: 'Miguel Sánchez',
      email: 'miguel.sanchez@magneticplace.com',
      phone: '+34 634 567 890',
      department: 'Marketing',
      position: 'Especialista en Marketing Digital',
      status: 'Activo',
      joinDate: '2022-01-10',
      location: 'Valencia',
      tags: ['Proyecto C', 'Marketing']
    },
    {
      id: 'EMP004',
      name: 'Laura García',
      email: 'laura.garcia@magneticplace.com',
      phone: '+34 645 678 901',
      department: 'Ventas',
      position: 'Ejecutiva de Ventas',
      status: 'Vacaciones',
      joinDate: '2022-06-05',
      location: 'Madrid',
      tags: ['Proyecto A', 'Ventas']
    },
    {
      id: 'EMP005',
      name: 'Javier López',
      email: 'javier.lopez@magneticplace.com',
      phone: '+34 656 789 012',
      department: 'Desarrollo',
      position: 'Desarrollador Backend',
      status: 'Activo',
      joinDate: '2022-04-15',
      location: 'Barcelona',
      tags: ['Proyecto B', 'Backend']
    }
  ];

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      calculateStats();
      setIsLoading(false);
    }, 1000);
  }, [dateRange]);

  const calculateStats = () => {
    // Contar empleados
    const totalEmployees = sampleEmployees.length;
    const activeEmployees = sampleEmployees.filter(emp => emp.status === 'Activo').length;
    
    // Calcular horas trabajadas
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let filteredRecords = sampleTimeRecords;
    
    if (dateRange === 'week') {
      // Filtrar registros de la última semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredRecords = sampleTimeRecords.filter(record => new Date(record.date) >= oneWeekAgo);
    } else if (dateRange === 'month') {
      // Filtrar registros del mes actual
      filteredRecords = sampleTimeRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      });
    } else if (dateRange === 'year') {
      // Filtrar registros del año actual
      filteredRecords = sampleTimeRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === currentYear;
      });
    }
    
    // Calcular total de horas
    const totalHours = filteredRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
    
    // Calcular promedio de horas por día
    const uniqueDays = new Set(filteredRecords.map(record => record.date)).size;
    const averageHoursPerDay = uniqueDays > 0 ? totalHours / uniqueDays : 0;
    
    // Calcular tasa de asistencia
    const workingDays = 22; // Aproximadamente 22 días laborables en un mes
    const expectedAttendance = workingDays * sampleEmployees.length;
    const actualAttendance = new Set(filteredRecords.map(record => `${record.date}-${record.employeeId}`)).size;
    const attendanceRate = expectedAttendance > 0 ? (actualAttendance / expectedAttendance) * 100 : 0;
    
    // Calcular tasa de llegadas tardías
    const lateArrivals = filteredRecords.filter(record => {
      const checkInTime = new Date(`${record.date}T${record.checkIn}`);
      const expectedCheckIn = new Date(`${record.date}T09:00:00`); // Asumiendo que el horario de entrada es a las 9:00
      return checkInTime > expectedCheckIn;
    }).length;
    const lateArrivalRate = actualAttendance > 0 ? (lateArrivals / actualAttendance) * 100 : 0;
    
    // Calcular distribución por departamento
    const departmentCounts = {};
    sampleEmployees.forEach(emp => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
    });
    
    const departmentDistribution = Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count,
      percentage: (count / totalEmployees) * 100
    }));
    
    // Generar actividad reciente
    const recentActivity = filteredRecords
      .sort((a, b) => new Date(`${b.date}T${b.checkIn}`) - new Date(`${a.date}T${a.checkIn}`))
      .slice(0, 5)
      .map(record => {
        const employee = sampleEmployees.find(emp => emp.id === record.employeeId);
        return {
          id: `${record.date}-${record.employeeId}`,
          employeeId: record.employeeId,
          employeeName: employee ? employee.name : 'Empleado Desconocido',
          action: 'Registro de entrada/salida',
          date: record.date,
          time: record.checkIn,
          details: `Entrada: ${record.checkIn}, Salida: ${record.checkOut}, Horas: ${record.hoursWorked}`
        };
      });
    
    // Calcular horas por día
    const hoursPerDayMap = {};
    filteredRecords.forEach(record => {
      hoursPerDayMap[record.date] = (hoursPerDayMap[record.date] || 0) + record.hoursWorked;
    });
    
    const hoursPerDay = Object.entries(hoursPerDayMap)
      .map(([date, hours]) => ({ date, hours }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Últimos 7 días con datos
    
    // Calcular empleados con más horas
    const employeeHours = {};
    filteredRecords.forEach(record => {
      employeeHours[record.employeeId] = (employeeHours[record.employeeId] || 0) + record.hoursWorked;
    });
    
    const topEmployees = Object.entries(employeeHours)
      .map(([employeeId, hours]) => {
        const employee = sampleEmployees.find(emp => emp.id === employeeId);
        return {
          id: employeeId,
          name: employee ? employee.name : 'Empleado Desconocido',
          department: employee ? employee.department : 'Desconocido',
          hours
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
    
    setStats({
      totalEmployees,
      activeEmployees,
      totalHoursThisMonth: totalHours,
      averageHoursPerDay,
      attendanceRate,
      lateArrivalRate,
      departmentDistribution,
      recentActivity,
      hoursPerDay,
      topEmployees
    });
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setIsLoading(true);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Resumen de actividad y métricas clave</p>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => handleDateRangeChange('week')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => handleDateRangeChange('year')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'year'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Este Año
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tarjeta: Total de Empleados */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Empleados</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="text-green-500 font-medium">{stats.activeEmployees} activos</span> ({Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}%)
              </p>
            </div>
          </div>

          {/* Tarjeta: Horas Trabajadas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Horas Trabajadas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalHoursThisMonth.toFixed(1)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Promedio: <span className="text-green-500 font-medium">{stats.averageHoursPerDay.toFixed(1)} horas/día</span>
              </p>
            </div>
          </div>

          {/* Tarjeta: Tasa de Asistencia */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tasa de Asistencia</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${stats.attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tarjeta: Llegadas Tardías */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Llegadas Tardías</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lateArrivalRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${stats.lateArrivalRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico: Distribución por Departamento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Departamento</h2>
            <div className="space-y-4">
              {stats.departmentDistribution.map((dept) => (
                <div key={dept.department}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                    <span className="text-sm font-medium text-gray-700">{dept.count} ({dept.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico: Horas por Día */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Horas Trabajadas por Día</h2>
            <div className="h-64 flex items-end space-x-2">
              {stats.hoursPerDay.map((day) => {
                const height = (day.hours / 10) * 100; // Asumiendo un máximo de 10 horas por día
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${Math.min(height, 100)}%` }}
                    ></div>
                    <p className="text-xs text-gray-500 mt-2">{new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                    <p className="text-xs font-medium">{day.hours.toFixed(1)}h</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabla: Empleados con Más Horas */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Empleados por Horas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-500 font-medium">{employee.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.hours.toFixed(1)} horas</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla: Actividad Reciente */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentActivity.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.employeeName}</div>
                        <div className="text-sm text-gray-500">{activity.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.action}</div>
                        <div className="text-sm text-gray-500">{activity.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(activity.date).toLocaleDateString('es-ES')}</div>
                        <div className="text-sm text-gray-500">{activity.time}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
