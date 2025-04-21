'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';

export default function ViewEmployeePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');
  const [employee, setEmployee] = useState(null);
  const [timeRecords, setTimeRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

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
      tags: ['Proyecto A', 'Frontend'],
      manager: 'Ana Martínez',
      emergencyContact: {
        name: 'María Rodríguez',
        relationship: 'Esposa',
        phone: '+34 623 456 789'
      },
      address: 'Calle Principal 123, Madrid',
      birthDate: '1985-07-22',
      documents: [
        { name: 'Contrato', date: '2022-03-10', type: 'PDF' },
        { name: 'CV', date: '2022-02-28', type: 'PDF' }
      ]
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
      tags: ['Proyecto B', 'Diseño'],
      manager: 'Javier López',
      emergencyContact: {
        name: 'Pedro Martínez',
        relationship: 'Hermano',
        phone: '+34 634 567 890'
      },
      address: 'Avenida Central 456, Barcelona',
      birthDate: '1990-04-15',
      documents: [
        { name: 'Contrato', date: '2022-05-15', type: 'PDF' },
        { name: 'CV', date: '2022-04-30', type: 'PDF' }
      ]
    }
  ];

  // Datos de ejemplo para los registros de tiempo
  const sampleTimeRecords = [
    {
      id: 'TR001',
      employeeId: 'EMP001',
      date: '2024-04-20',
      startTime: '08:30',
      endTime: '17:45',
      totalHours: 9.25,
      status: 'Aprobado',
      location: 'Oficina Madrid',
      notes: 'Trabajo regular'
    },
    {
      id: 'TR002',
      employeeId: 'EMP001',
      date: '2024-04-19',
      startTime: '08:15',
      endTime: '17:30',
      totalHours: 9.25,
      status: 'Aprobado',
      location: 'Remoto',
      notes: 'Trabajo desde casa'
    },
    {
      id: 'TR003',
      employeeId: 'EMP001',
      date: '2024-04-18',
      startTime: '08:45',
      endTime: '18:00',
      totalHours: 9.25,
      status: 'Aprobado',
      location: 'Oficina Madrid',
      notes: 'Reunión de proyecto'
    },
    {
      id: 'TR004',
      employeeId: 'EMP002',
      date: '2024-04-20',
      startTime: '08:30',
      endTime: '17:30',
      totalHours: 9,
      status: 'Aprobado',
      location: 'Oficina Barcelona',
      notes: 'Trabajo regular'
    }
  ];

  useEffect(() => {
    if (employeeId) {
      // Simulación de carga de datos del empleado
      const foundEmployee = sampleEmployees.find(emp => emp.id === employeeId);
      setEmployee(foundEmployee || null);

      // Simulación de carga de registros de tiempo del empleado
      const employeeTimeRecords = sampleTimeRecords.filter(record => record.employeeId === employeeId);
      setTimeRecords(employeeTimeRecords);
    }
  }, [employeeId]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (employeeId) {
      router.push(`/admin/employees/edit-employee?id=${employeeId}`);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-4">No se encontró el empleado con ID: {employeeId}</p>
            <button
              onClick={handleBack}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Detalles del Empleado</h1>
          </div>
          <button
            onClick={handleEdit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Editar Empleado
          </button>
        </div>

        {/* Perfil del empleado */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-500 font-medium">
                  {employee.name.charAt(0)}
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                <p className="text-gray-600 mb-2">{employee.position} - {employee.department}</p>
                <div className="flex flex-wrap items-center mb-4">
                  <span className={`px-2 py-1 mr-2 text-xs font-semibold rounded-full ${
                    employee.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Desde {formatDate(employee.joinDate)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span> {employee.email}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Teléfono:</span> {employee.phone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Ubicación:</span> {employee.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">Responsable:</span> {employee.manager}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Fecha de nacimiento:</span> {formatDate(employee.birthDate)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Dirección:</span> {employee.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Información Personal
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'time'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('time')}
              >
                Registros de Tiempo
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'docs'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('docs')}
              >
                Documentos
              </button>
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Contacto de Emergencia</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">Nombre:</span> {employee.emergencyContact.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Relación:</span> {employee.emergencyContact.relationship}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Teléfono:</span> {employee.emergencyContact.phone}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Etiquetas</h4>
                    <div className="flex flex-wrap">
                      {employee.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-2 mb-2"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'time' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Registros de Tiempo Recientes</h3>
                {timeRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entrada
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Salida
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ubicación
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timeRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(record.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.startTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.totalHours} h
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.location}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No hay registros de tiempo disponibles.</p>
                )}
              </div>
            )}

            {activeTab === 'docs' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos</h3>
                {employee.documents && employee.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employee.documents.map((doc, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{formatDate(doc.date)} · {doc.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay documentos disponibles.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
