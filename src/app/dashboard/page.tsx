'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { sampleTimeRecords } from '@/lib/sample-data';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('week');
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalHours: 0,
    avgDailyHours: 0,
    attendanceRate: 0,
    lateArrivalRate: 0
  });
  const [departmentDistribution, setDepartmentDistribution] = useState([
    { department: 'Operaciones', count: 0 },
    { department: 'Administración', count: 0 },
    { department: 'Ventas', count: 0 },
    { department: 'Desarrollo', count: 0 }
  ]);
  const [weeklyHours, setWeeklyHours] = useState([
    { day: 'Lun', hours: 0 },
    { day: 'Mar', hours: 0 },
    { day: 'Mié', hours: 0 },
    { day: 'Jue', hours: 0 },
    { day: 'Vie', hours: 0 },
    { day: 'Sáb', hours: 0 },
    { day: 'Dom', hours: 0 }
  ]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Empleados de ejemplo
  const sampleEmployees = [
    {
      id: 'EMP001',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@magneticplace.com',
      department: 'Operaciones',
      status: 'Registrado (08:30)',
      statusClass: 'bg-green-100 text-green-800',
      phone: '+34 612 345 678',
      position: 'Técnico Senior',
      hireDate: '2023-05-15'
    },
    {
      id: 'EMP002',
      name: 'Ana Martínez',
      email: 'ana.martinez@magneticplace.com',
      department: 'Administración',
      status: 'Registrada (08:15)',
      statusClass: 'bg-green-100 text-green-800',
      phone: '+34 623 456 789',
      position: 'Gerente Administrativa',
      hireDate: '2022-11-10'
    },
    {
      id: 'EMP003',
      name: 'Miguel Sánchez',
      email: 'miguel.sanchez@magneticplace.com',
      department: 'Ventas',
      status: 'No registrado',
      statusClass: 'bg-red-100 text-red-800',
      phone: '+34 634 567 890',
      position: 'Representante de Ventas',
      hireDate: '2024-01-20'
    },
    {
      id: 'EMP004',
      name: 'Laura Gómez',
      email: 'laura.gomez@magneticplace.com',
      department: 'Desarrollo',
      status: 'Registrada (08:45)',
      statusClass: 'bg-green-100 text-green-800',
      phone: '+34 645 678 901',
      position: 'Desarrolladora Frontend',
      hireDate: '2023-08-05'
    },
    {
      id: 'EMP005',
      name: 'Javier López',
      email: 'javier.lopez@magneticplace.com',
      department: 'Desarrollo',
      status: 'Registrado (09:00)',
      statusClass: 'bg-yellow-100 text-yellow-800',
      phone: '+34 656 789 012',
      position: 'Desarrollador Backend',
      hireDate: '2023-03-15'
    }
  ];

  // Actividad reciente de ejemplo
  const sampleActivity = [
    { id: 'ACT001', userId: 'EMP001', userName: 'Carlos Rodríguez', action: 'Entrada', time: '08:30', date: '2024-04-20' },
    { id: 'ACT002', userId: 'EMP002', userName: 'Ana Martínez', action: 'Entrada', time: '08:15', date: '2024-04-20' },
    { id: 'ACT003', userId: 'EMP004', userName: 'Laura Gómez', action: 'Entrada', time: '08:45', date: '2024-04-20' },
    { id: 'ACT004', userId: 'EMP005', userName: 'Javier López', action: 'Entrada', time: '09:00', date: '2024-04-20' },
    { id: 'ACT005', userId: 'EMP001', userName: 'Carlos Rodríguez', action: 'Salida', time: '17:45', date: '2024-04-19' },
    { id: 'ACT006', userId: 'EMP002', userName: 'Ana Martínez', action: 'Salida', time: '17:30', date: '2024-04-19' }
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Calcular métricas basadas en el filtro de tiempo
    calculateMetrics();
    calculateDepartmentDistribution();
    calculateWeeklyHours();
    calculateTopEmployees();
    setRecentActivity(sampleActivity);
  }, [timeFilter]);

  const calculateMetrics = () => {
    // Simulación de cálculo de métricas
    setMetrics({
      totalEmployees: sampleEmployees.length,
      activeEmployees: sampleEmployees.filter(emp => emp.status.toLowerCase().includes('registrad')).length,
      totalHours: 185, // Horas totales trabajadas en el período
      avgDailyHours: 7.4, // Promedio diario de horas trabajadas
      attendanceRate: 80, // Tasa de asistencia (%)
      lateArrivalRate: 15 // Tasa de llegadas tardías (%)
    });
  };

  const calculateDepartmentDistribution = () => {
    // Calcular distribución por departamento
    const departments: Record<string, number> = {};
    sampleEmployees.forEach(emp => {
      if (!departments[emp.department]) {
        departments[emp.department] = 0;
      }
      departments[emp.department]++;
    });

    const distribution = Object.keys(departments).map(dept => ({
      department: dept,
      count: departments[dept]
    }));

    setDepartmentDistribution(distribution);
  };

  const calculateWeeklyHours = () => {
    // Simulación de horas trabajadas por día de la semana
    const hours = [
      { day: 'Lun', hours: 38 },
      { day: 'Mar', hours: 42 },
      { day: 'Mié', hours: 35 },
      { day: 'Jue', hours: 37 },
      { day: 'Vie', hours: 33 },
      { day: 'Sáb', hours: 0 },
      { day: 'Dom', hours: 0 }
    ];

    setWeeklyHours(hours);
  };

  const calculateTopEmployees = () => {
    // Simulación de empleados con más horas trabajadas
    const top = [
      { id: 'EMP001', name: 'Carlos Rodríguez', department: 'Operaciones', hours: 42.5 },
      { id: 'EMP004', name: 'Laura Gómez', department: 'Desarrollo', hours: 40.0 },
      { id: 'EMP002', name: 'Ana Martínez', department: 'Administración', hours: 39.5 },
      { id: 'EMP005', name: 'Javier López', department: 'Desarrollo', hours: 38.0 },
      { id: 'EMP003', name: 'Miguel Sánchez', department: 'Ventas', hours: 25.0 }
    ];

    setTopEmployees(top);
  };

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  // Función para generar el gráfico de barras de distribución por departamento
  const renderDepartmentChart = () => {
    const maxCount = Math.max(...departmentDistribution.map(d => d.count));
    
    return (
      <div className="mt-4">
        {departmentDistribution.map((dept, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-32">{dept.department}</span>
              <div className="flex-1">
                <div className="relative h-8">
                  <div 
                    className="absolute top-0 left-0 h-8 bg-blue-500 rounded"
                    style={{ width: `${(dept.count / maxCount) * 100}%` }}
                  ></div>
                  <div className="absolute top-0 left-0 h-8 flex items-center pl-2 text-white font-medium">
                    {dept.count} empleados
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Función para generar el gráfico de líneas de horas por día
  const renderWeeklyHoursChart = () => {
    const maxHours = Math.max(...weeklyHours.map(d => d.hours));
    const chartHeight = 150;
    
    return (
      <div className="mt-4 h-[200px]">
        <div className="flex h-[150px] items-end justify-between">
          {weeklyHours.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-10 bg-blue-500 rounded-t"
                style={{ 
                  height: day.hours > 0 ? `${(day.hours / maxHours) * chartHeight}px` : '4px',
                  backgroundColor: day.hours === 0 ? '#e5e7eb' : undefined
                }}
              ></div>
              <div className="text-xs font-medium text-gray-600 mt-2">{day.day}</div>
            </div>
          ))}
        </div>
      </div>
    );
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

  if (!isAuthenticated) {
    return null; // Redirigiendo
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          
          <div className="flex space-x-2 bg-white rounded-lg shadow-sm p-1">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => handleFilterChange('week')}
            >
              Esta semana
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => handleFilterChange('month')}
            >
              Este mes
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${timeFilter === 'year' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => handleFilterChange('year')}
            >
              Este año
            </button>
          </div>
        </div>
        
        {/* Métricas clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Empleados</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{metrics.totalEmployees}</p>
                <p className="text-sm text-gray-500">Total de empleados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{metrics.activeEmployees}</p>
                <p className="text-sm text-gray-500">Activos hoy</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Horas Trabajadas</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{metrics.totalHours}</p>
                <p className="text-sm text-gray-500">Total de horas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{metrics.avgDailyHours}</p>
                <p className="text-sm text-gray-500">Promedio diario</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Asistencia</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{metrics.attendanceRate}%</p>
                <p className="text-sm text-gray-500">Tasa de asistencia</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">{metrics.lateArrivalRate}%</p>
                <p className="text-sm text-gray-500">Llegadas tardías</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Distribución por Departamento</h2>
            {renderDepartmentChart()}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Horas Trabajadas por Día</h2>
            {renderWeeklyHoursChart()}
          </div>
        </div>
        
        {/* Tablas de datos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Empleados por Horas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.hours}h</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.action === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{activity.date} {activity.time}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Enlaces a otras secciones */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a 
            href="/admin/employees"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Empleados</h3>
            <p className="text-gray-600">Administra la información de tus empleados</p>
          </a>
          
          <a 
            href="/reports"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Informes</h3>
            <p className="text-gray-600">Genera informes detallados de tiempo y asistencia</p>
          </a>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Configuración</h3>
            <p className="text-gray-600">Personaliza la configuración del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}
