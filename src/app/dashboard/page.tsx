'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('week');
  const [metrics, setMetrics] = useState({
    totalEmployees: 5,
    activeEmployees: 4,
    totalHours: 185,
    avgDailyHours: 7.4,
    attendanceRate: 80,
    lateArrivalRate: 15
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Filtros de tiempo */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button 
            onClick={() => setTimeFilter('week')}
            className={`px-4 py-2 rounded ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Esta semana
          </button>
          <button 
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 rounded ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Este mes
          </button>
          <button 
            onClick={() => setTimeFilter('year')}
            className={`px-4 py-2 rounded ${timeFilter === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Este año
          </button>
        </div>
      </div>
      
      {/* Métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Empleados</h2>
          <div className="flex justify-between">
            <div>
              <p className="metric-value">{metrics.totalEmployees}</p>
              <p className="metric-label">Total de empleados</p>
            </div>
            <div>
              <p className="metric-value">{metrics.activeEmployees}</p>
              <p className="metric-label">Activos hoy</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Horas Trabajadas</h2>
          <div className="flex justify-between">
            <div>
              <p className="metric-value">{metrics.totalHours}</p>
              <p className="metric-label">Total de horas</p>
            </div>
            <div>
              <p className="metric-value">{metrics.avgDailyHours}</p>
              <p className="metric-label">Promedio diario</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Asistencia</h2>
          <div className="flex justify-between">
            <div>
              <p className="metric-value">{metrics.attendanceRate}%</p>
              <p className="metric-label">Tasa de asistencia</p>
            </div>
            <div>
              <p className="metric-value">{metrics.lateArrivalRate}%</p>
              <p className="metric-label">Llegadas tardías</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enlaces a otras secciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <a href="/admin/employees" className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-2">Gestión de Empleados</h3>
          <p className="text-gray-600">Administra la información de tus empleados</p>
        </a>
        
        <a href="/reports" className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-2">Informes</h3>
          <p className="text-gray-600">Genera informes detallados de tiempo y asistencia</p>
        </a>
        
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-2">Configuración</h3>
          <p className="text-gray-600">Personaliza la configuración del sistema</p>
        </div>
      </div>
    </div>
  );
}
