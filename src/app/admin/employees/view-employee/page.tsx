'use client';

import React, { useEffect, useState } from 'react';

export default function ViewEmployeePage() {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeData, setEmployeeData] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    status: '',
    statusClass: '',
    phone: '',
    address: '',
    emergencyContact: '',
    notes: ''
  });

  // Obtener el ID del empleado de la URL al cargar la página
  useEffect(() => {
    // Función para obtener parámetros de la URL
    const getQueryParam = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };

    const id = getQueryParam('id');
    if (id) {
      setEmployeeId(id);
      
      // Simulación de carga de datos del empleado según el ID
      // En una aplicación real, esto sería una llamada a una API o base de datos
      const employeeMap = {
        'EMP001': {
          id: 'EMP001',
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@magneticplace.com',
          department: 'Operaciones',
          position: 'Técnico Senior',
          startDate: '2023-05-15',
          status: 'Registrado (08:30)',
          statusClass: 'bg-green-100 text-green-800',
          phone: '+34 612 345 678',
          address: 'Calle Principal 123, Madrid',
          emergencyContact: 'María Rodríguez - +34 698 765 432',
          notes: 'Especialista en instalaciones industriales. Certificado en seguridad industrial.'
        },
        'EMP002': {
          id: 'EMP002',
          name: 'Ana Martínez',
          email: 'ana.martinez@magneticplace.com',
          department: 'Administración',
          position: 'Gerente Administrativa',
          startDate: '2022-11-10',
          status: 'Registrada (08:15)',
          statusClass: 'bg-green-100 text-green-800',
          phone: '+34 623 456 789',
          address: 'Avenida Central 45, Barcelona',
          emergencyContact: 'Juan Martínez - +34 687 654 321',
          notes: 'Responsable de contabilidad y recursos humanos. Máster en administración de empresas.'
        },
        'EMP003': {
          id: 'EMP003',
          name: 'Miguel Sánchez',
          email: 'miguel.sanchez@magneticplace.com',
          department: 'Ventas',
          position: 'Representante de Ventas',
          startDate: '2024-01-20',
          status: 'No registrado',
          statusClass: 'bg-red-100 text-red-800',
          phone: '+34 634 567 890',
          address: 'Plaza Mayor 8, Valencia',
          emergencyContact: 'Laura Sánchez - +34 676 543 210',
          notes: 'Especializado en desarrollo de nuevos clientes. Experiencia previa en el sector industrial.'
        }
      };
      
      if (employeeMap[id]) {
        setEmployeeData(employeeMap[id]);
      }
    }
  }, []);

  // Datos de ejemplo para estadísticas y registros
  const employeeStats = {
    hoursThisMonth: '168h 30m',
    daysWorked: 21,
    punctuality: '95%',
    extraHours: '12h 45m'
  };

  const timeRecords = [
    { date: '2024-04-20', entry: '08:30', exit: '17:45', total: '9h 15m', status: 'Completado' },
    { date: '2024-04-19', entry: '08:15', exit: '17:30', total: '9h 15m', status: 'Completado' },
    { date: '2024-04-18', entry: '08:45', exit: '18:00', total: '9h 15m', status: 'Llegada tarde' },
    { date: '2024-04-17', entry: '08:30', exit: '17:30', total: '9h 00m', status: 'Completado' },
    { date: '2024-04-16', entry: '08:30', exit: '17:30', total: '9h 00m', status: 'Completado' }
  ];

  const formatDate = (dateString) => {
    // Corregido: Usar tipos literales específicos en lugar de strings genéricas
    const options = { 
      year: "numeric" as const, 
      month: "long" as const, 
      day: "numeric" as const 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles del Empleado</h1>
        <div className="flex space-x-2">
          <a 
            href="/admin/employees" 
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Volver
          </a>
          <a 
            href={`/admin/employees/edit-employee?id=${employeeId}`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Editar
          </a>
        </div>
      </div>
      
      {/* Información básica */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{employeeData.name}</h2>
            <p className="text-gray-600">{employeeData.position} - {employeeData.department}</p>
            <div className="mt-1">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${employeeData.statusClass}`}>
                {employeeData.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Información de Contacto</h3>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {employeeData.id}</p>
              <p><span className="font-medium">Email:</span> {employeeData.email}</p>
              <p><span className="font-medium">Teléfono:</span> {employeeData.phone}</p>
              <p><span className="font-medium">Dirección:</span> {employeeData.address}</p>
              <p><span className="font-medium">Contacto de Emergencia:</span> {employeeData.emergencyContact}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Información Laboral</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Departamento:</span> {employeeData.department}</p>
              <p><span className="font-medium">Cargo:</span> {employeeData.position}</p>
              <p><span className="font-medium">Fecha de Inicio:</span> {formatDate(employeeData.startDate)}</p>
              <p><span className="font-medium">Notas:</span> {employeeData.notes}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estadísticas laborales */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Estadísticas Laborales (Mes Actual)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Horas Trabajadas</h4>
            <p className="text-2xl font-bold text-blue-600">{employeeStats.hoursThisMonth}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Días Trabajados</h4>
            <p className="text-2xl font-bold text-green-600">{employeeStats.daysWorked} días</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Puntualidad</h4>
            <p className="text-2xl font-bold text-purple-600">{employeeStats.punctuality}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800">Horas Extra</h4>
            <p className="text-2xl font-bold text-yellow-600">{employeeStats.extraHours}</p>
          </div>
        </div>
      </div>
      
      {/* Historial de registros */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Historial de Registros Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeRecords.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.entry}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.exit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <a 
            href={`/reports?userId=${employeeId}`}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            Ver todos los registros →
          </a>
        </div>
      </div>
    </div>
  );
}
