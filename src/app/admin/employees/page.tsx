'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';

export default function EmployeesPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
      position: 'Especialista SEO',
      status: 'Inactivo',
      joinDate: '2022-01-10',
      location: 'Valencia',
      tags: ['Proyecto C', 'SEO']
    },
    {
      id: 'EMP004',
      name: 'Laura Gómez',
      email: 'laura.gomez@magneticplace.com',
      phone: '+34 645 678 901',
      department: 'Ventas',
      position: 'Ejecutiva de Cuentas',
      status: 'Activo',
      joinDate: '2022-07-05',
      location: 'Sevilla',
      tags: ['Proyecto D', 'Ventas']
    },
    {
      id: 'EMP005',
      name: 'Javier López',
      email: 'javier.lopez@magneticplace.com',
      phone: '+34 656 789 012',
      department: 'Desarrollo',
      position: 'Desarrollador Backend',
      status: 'Activo',
      joinDate: '2022-02-28',
      location: 'Madrid',
      tags: ['Proyecto A', 'Backend']
    }
  ];

  useEffect(() => {
    // Simulación de carga de datos
    setEmployees(sampleEmployees);
  }, []);

  useEffect(() => {
    // Filtrar empleados basado en los criterios de búsqueda y filtros
    let filtered = [...employees];
    
    if (searchTerm) {
      filtered = filtered.filter(
        employee =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(
        employee => employee.department === departmentFilter
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(
        employee => employee.status === statusFilter
      );
    }
    
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  // Obtener departamentos únicos para el filtro
  const departments = [...new Set(employees.map(employee => employee.department))];
  
  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentFilter = (e) => {
    setDepartmentFilter(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleAddEmployee = () => {
    alert('Funcionalidad de añadir empleado - Próximamente');
  };

  const handleEditEmployee = (id) => {
    alert(`Editar empleado con ID: ${id} - Próximamente`);
  };

  const handleViewEmployee = (id) => {
    alert(`Ver detalles del empleado con ID: ${id} - Próximamente`);
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      // Simulación de eliminación
      const updatedEmployees = employees.filter(employee => employee.id !== id);
      setEmployees(updatedEmployees);
      alert('Empleado eliminado correctamente');
    }
  };

  const handleExportData = (format) => {
    // Simulación de exportación de datos
    alert(`Datos exportados en formato ${format}`);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
          <button
            onClick={handleAddEmployee}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Añadir Empleado
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Nombre o email"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                id="department"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={departmentFilter}
                onChange={handleDepartmentFilter}
              >
                <option value="">Todos los departamentos</option>
                {departments.map((department, index) => (
                  <option key={index} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="flex space-x-2">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleExportData('csv')}
              >
                Exportar CSV
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleExportData('pdf')}
              >
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de empleados */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 font-medium">{employee.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewEmployee(employee.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEditEmployee(employee.id)}
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
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                    <span className="font-medium">
                      {indexOfLastItem > filteredEmployees.length ? filteredEmployees.length : indexOfLastItem}
                    </span>{' '}
                    de <span className="font-medium">{filteredEmployees.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
