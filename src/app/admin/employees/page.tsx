'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Componente para la gestión de empleados
function AdminEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar empleados al montar el componente
    const loadEmployees = () => {
      try {
        // Obtener empleados del localStorage
        const storedEmployees = localStorage.getItem('timetracker_employees');
        const employeesList = storedEmployees ? JSON.parse(storedEmployees) : getSampleEmployees();
        setEmployees(employeesList);
      } catch (error) {
        console.error('Error al cargar empleados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Función para obtener empleados de muestra si no hay datos en localStorage
  const getSampleEmployees = () => {
    return [
      {
        id: 'EMP001',
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        department: 'Operaciones',
        position: 'Gerente de Operaciones',
        startDate: '2023-01-15',
        status: 'active'
      },
      {
        id: 'EMP002',
        name: 'Ana Martínez',
        email: 'ana@example.com',
        department: 'Administración',
        position: 'Contadora',
        startDate: '2023-02-10',
        status: 'active'
      },
      {
        id: 'EMP003',
        name: 'Miguel Sánchez',
        email: 'miguel@example.com',
        department: 'Ventas',
        position: 'Representante de Ventas',
        startDate: '2023-03-05',
        status: 'active'
      },
      {
        id: 'EMP004',
        name: 'Laura Gómez',
        email: 'laura@example.com',
        department: 'Tecnología',
        position: 'Desarrolladora Frontend',
        startDate: '2023-04-12',
        status: 'active'
      },
      {
        id: 'EMP005',
        name: 'Javier López',
        email: 'javier@example.com',
        department: 'Recursos Humanos',
        position: 'Coordinador de RRHH',
        startDate: '2023-05-20',
        status: 'active'
      }
    ];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
        <a 
          href="/admin/employees/add-employee" 
          className="btn-primary"
        >
          Añadir Empleado
        </a>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Cargando empleados...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {employees.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No hay empleados registrados.</p>
              <a 
                href="/admin/employees/add-employee" 
                className="mt-4 inline-block text-blue-600 hover:text-blue-800"
              >
                Añadir el primer empleado
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map(employee => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href={`/admin/employees/view-employee?id=${employee.id}`} className="text-blue-600 hover:text-blue-900 mr-3">Ver</a>
                        <a href={`/admin/employees/edit-employee?id=${employee.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Exportar el componente
export default AdminEmployeesPage;
