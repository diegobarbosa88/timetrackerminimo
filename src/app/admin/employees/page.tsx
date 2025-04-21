'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';

export default function AdminEmployeesPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@magneticplace.com',
      department: 'Operaciones',
      status: 'Registrado (08:30)',
      statusClass: 'bg-green-100 text-green-800',
      phone: '+34 612 345 678',
      position: 'Técnico Senior',
      hireDate: '2023-05-15',
      address: 'Calle Principal 123, Madrid',
      emergencyContact: 'María Rodríguez - +34 698 765 432',
      notes: 'Especialista en instalaciones industriales. Certificado en seguridad industrial.'
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
      hireDate: '2022-11-10',
      address: 'Avenida Central 45, Barcelona',
      emergencyContact: 'Juan Martínez - +34 687 654 321',
      notes: 'Responsable de contabilidad y recursos humanos. Máster en administración de empresas.'
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
      hireDate: '2024-01-20',
      address: 'Plaza Mayor 8, Valencia',
      emergencyContact: 'Laura Sánchez - +34 676 543 210',
      notes: 'Especializado en desarrollo de nuevos clientes. Experiencia previa en el sector industrial.'
    }
  ]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const employeesPerPage = 3;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!loading && isAuthenticated && user?.role !== 'admin') {
      // Redirigir a usuarios no administradores
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, user]);

  // Inicializar empleados filtrados
  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = [...employees];
    
    // Filtrar por departamento
    if (department !== 'all') {
      filtered = filtered.filter(emp => 
        emp.department.toLowerCase() === department.toLowerCase()
      );
    }
    
    // Filtrar por estado
    if (status === 'active') {
      filtered = filtered.filter(emp => 
        emp.status.toLowerCase().includes('registrad')
      );
    } else if (status === 'inactive') {
      filtered = filtered.filter(emp => 
        emp.status.toLowerCase().includes('no registrado')
      );
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Función para exportar lista
  const handleExportList = () => {
    // Ejemplo de descarga de CSV
    const headers = ['ID', 'Nombre', 'Email', 'Departamento', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...filteredEmployees.map(emp => 
        [emp.id, emp.name, emp.email, emp.department, emp.status].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'empleados.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para eliminar empleado
  const handleDeleteEmployee = (employeeId) => {
    if (confirm('¿Está seguro que desea eliminar este empleado? Esta acción no se puede deshacer.')) {
      // Filtrar el empleado eliminado
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
      alert('Empleado eliminado correctamente');
    }
  };

  // Paginación
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Redirigiendo
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Empleados</h1>
        
        {/* Panel de control */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Empleados</h2>
              <p className="text-gray-600">Total: {filteredEmployees.length} empleados</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Enlace HTML nativo para Añadir Empleado */}
              <a 
                href="/admin/employees/add-employee"
                className="btn-primary flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Añadir Empleado
              </a>
              <button 
                className="btn-secondary flex items-center justify-center"
                onClick={handleExportList}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Exportar Lista
              </button>
            </div>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                id="department"
                name="department"
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="operaciones">Operaciones</option>
                <option value="administración">Administración</option>
                <option value="ventas">Ventas</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                name="search"
                className="form-input"
                placeholder="Nombre, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button 
                className="btn-primary w-full"
                onClick={applyFilters}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
        
        {/* Lista de empleados */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Empleados</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Actual</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">ID: {employee.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.statusClass}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Enlaces HTML nativos para Editar y Ver con ID del empleado */}
                        <a 
                          href={`/admin/employees/edit-employee?id=${employee.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </a>
                        <a 
                          href={`/admin/employees/view-employee?id=${employee.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Ver
                        </a>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{indexOfFirstEmployee + 1}</span> a <span className="font-medium">{Math.min(indexOfLastEmployee, filteredEmployees.length)}</span> de <span className="font-medium">{filteredEmployees.length}</span> resultados
            </div>
            <div className="flex space-x-2">
              <button 
                className={`btn-secondary py-1 px-3 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <button 
                className={`btn-secondary py-1 px-3 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
