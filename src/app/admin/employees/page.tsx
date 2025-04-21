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
        
        if (storedEmployees) {
          try {
            const parsedEmployees = JSON.parse(storedEmployees);
            // Verificar que sea un array
            if (Array.isArray(parsedEmployees)) {
              setEmployees(parsedEmployees);
            } else {
              console.error('Los datos almacenados no son un array:', parsedEmployees);
              const sampleData = getSampleEmployees();
              setEmployees(sampleData);
              // Corregir los datos en localStorage
              localStorage.setItem('timetracker_employees', JSON.stringify(sampleData));
            }
          } catch (parseError) {
            console.error('Error al parsear empleados del localStorage:', parseError);
            const sampleData = getSampleEmployees();
            setEmployees(sampleData);
            // Corregir los datos en localStorage
            localStorage.setItem('timetracker_employees', JSON.stringify(sampleData));
          }
        } else {
          // Si no hay datos, inicializar con los empleados de muestra
          const sampleData = getSampleEmployees();
          setEmployees(sampleData);
          // Guardar los datos de muestra en localStorage
          localStorage.setItem('timetracker_employees', JSON.stringify(sampleData));
        }
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        setEmployees(getSampleEmployees());
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

  // Función para eliminar un empleado
  const handleDeleteEmployee = (employeeId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.')) {
      try {
        // Filtrar el empleado a eliminar
        const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
        
        // Actualizar el estado
        setEmployees(updatedEmployees);
        
        // Actualizar localStorage
        localStorage.setItem('timetracker_employees', JSON.stringify(updatedEmployees));
        
        alert('Empleado eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        alert('Ocurrió un error al eliminar el empleado');
      }
    }
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
                        <button 
                          onClick={() => {
                            // Guardar el empleado seleccionado en localStorage para la vista detallada
                            localStorage.setItem('selected_employee', JSON.stringify(employee));
                            // Navegar a la página de detalles
                            window.location.href = `/admin/employees/view-employee?id=${employee.id}`;
                          }} 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => {
                            // Guardar el empleado seleccionado en localStorage para la edición
                            localStorage.setItem('selected_employee', JSON.stringify(employee));
                            // Navegar a la página de edición
                            window.location.href = `/admin/employees/edit-employee?id=${employee.id}`;
                          }} 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee.id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
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
