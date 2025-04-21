'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Importación directa sin usar alias @
import { useAuth } from '../../lib/auth';
// Importación directa sin usar alias @
import { sampleTimeRecords } from '../../lib/sample-data';

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

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Simulación de cálculo de métricas
    setMetrics({
      totalEmployees: 5,
      activeEmployees: 4,
      totalHours: 185,
      avgDailyHours: 7.4,
      attendanceRate: 80,
      lateArrivalRate: 15
    });
  }, [timeFilter]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
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
