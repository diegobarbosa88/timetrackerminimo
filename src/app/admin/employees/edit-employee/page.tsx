'use client';

import React, { useEffect, useState } from 'react';

// Definir interfaces para TypeScript
interface EmployeeData {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  startDate: string;
  status?: string;
  statusClass?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
}

export default function EditEmployeePage() {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    status: '',
    statusClass: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Obtener el ID del empleado de la URL al cargar la página
  useEffect(() => {
    // Función para obtener parámetros de la URL
    const getQueryParam = (param: string): string | null => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };

    const id = getQueryParam('id');
    if (id) {
      setEmployeeId(id);
      loadEmployeeData(id);
    } else {
      setError('No se proporcionó un ID de empleado válido');
      setLoading(false);
    }
  }, []);

  // Función para cargar datos del empleado desde localStorage
  const loadEmployeeData = (id: string): void => {
    try {
      // Primero intentar obtener el empleado seleccionado de localStorage
      const selectedEmployeeJson = localStorage.getItem('selected_employee');
      if (selectedEmployeeJson) {
        const selectedEmployee = JSON.parse(selectedEmployeeJson);
        
        // Verificar que el ID coincida
        if (selectedEmployee && selectedEmployee.id === id) {
          setEmployeeData(selectedEmployee);
          setLoading(false);
          return;
        }
      }
      
      // Si no hay empleado seleccionado o el ID no coincide, buscar en la lista completa
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        const employees = JSON.parse(storedEmployees);
        const employee = employees.find((emp: EmployeeData) => emp.id === id);
        
        if (employee) {
          setEmployeeData(employee);
          // Guardar el empleado seleccionado para futuras referencias
          localStorage.setItem('selected_employee', JSON.stringify(employee));
        } else {
          setError(`No se encontró ningún empleado con el ID: ${id}`);
        }
      } else {
        setError('No hay empleados registrados en el sistema');
      }
    } catch (error) {
      console.error('Error al cargar datos del empleado:', error);
      setError('Error al cargar datos del empleado');
    }
    
    setLoading(false);
  };

  // Función para eliminar empleado
  const handleDeleteEmployee = (): void => {
    if (confirm('¿Está seguro que desea eliminar este empleado? Esta acción no se puede deshacer.')) {
      try {
        const storedEmployees = localStorage.getItem('timetracker_employees');
        if (storedEmployees) {
          const employees = JSON.parse(storedEmployees);
          const updatedEmployees = employees.filter((emp: EmployeeData) => emp.id !== employeeId);
          
          // Actualizar localStorage
          localStorage.setItem('timetracker_employees', JSON.stringify(updatedEmployees));
          
          // Limpiar el empleado seleccionado si es el que se está eliminando
          const selectedEmployeeJson = localStorage.getItem('selected_employee');
          if (selectedEmployeeJson) {
            const selectedEmployee = JSON.parse(selectedEmployeeJson);
            if (selectedEmployee && selectedEmployee.id === employeeId) {
              localStorage.removeItem('selected_employee');
            }
          }
          
          alert(`Empleado ${employeeData.name} (${employeeId}) eliminado correctamente`);
          window.location.href = '/admin/employees';
        }
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        alert('Error al eliminar empleado');
      }
    }
  };

  // Función para guardar cambios
  const handleSaveChanges = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    
    try {
      // Obtener valores del formulario
      const form = event.target as HTMLFormElement;
      const updatedEmployee: EmployeeData = {
        id: employeeId,
        name: (form.elements.namedItem('name') as HTMLInputElement).value,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        department: (form.elements.namedItem('department') as HTMLSelectElement).value,
        position: (form.elements.namedItem('position') as HTMLInputElement).value,
        startDate: (form.elements.namedItem('startDate') as HTMLInputElement).value,
        phone: (form.elements.namedItem('phone') as HTMLInputElement)?.value || employeeData.phone || '',
        address: (form.elements.namedItem('address') as HTMLInputElement)?.value || employeeData.address || '',
        emergencyContact: (form.elements.namedItem('emergencyContact') as HTMLInputElement)?.value || employeeData.emergencyContact || '',
        notes: (form.elements.namedItem('notes') as HTMLTextAreaElement)?.value || employeeData.notes || '',
        status: employeeData.status || 'Activo',
        statusClass: employeeData.statusClass || 'bg-green-100 text-green-800'
      };
      
      // Actualizar en localStorage
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        const employees = JSON.parse(storedEmployees);
        const updatedEmployees = employees.map((emp: EmployeeData) => 
          emp.id === employeeId ? updatedEmployee : emp
        );
        
        localStorage.setItem('timetracker_employees', JSON.stringify(updatedEmployees));
        
        // Actualizar también el empleado seleccionado
        localStorage.setItem('selected_employee', JSON.stringify(updatedEmployee));
        
        alert(`Cambios guardados correctamente para ${updatedEmployee.name} (${employeeId})`);
        window.location.href = '/admin/employees';
      } else {
        setError('No se pudieron guardar los cambios: No hay empleados registrados');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('Error al guardar cambios');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Cargando información del empleado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-4">
            <a 
              href="/admin/employees" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Volver a la lista de empleados
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Editar Empleado</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form id="editEmployeeForm" onSubmit={handleSaveChanges}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employeeId">
              ID de Empleado
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100" 
              id="employeeId" 
              type="text" 
              value={employeeData.id}
              readOnly
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nombre Completo
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="name" 
              name="name"
              type="text" 
              defaultValue={employeeData.name}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="email" 
              name="email"
              type="email" 
              defaultValue={employeeData.email}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
              Departamento
            </label>
            <select 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="department"
              name="department"
              defaultValue={employeeData.department}
              required
            >
              <option value="Operaciones">Operaciones</option>
              <option value="Administración">Administración</option>
              <option value="Ventas">Ventas</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
              <option value="Marketing">Marketing</option>
              <option value="Finanzas">Finanzas</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
              Cargo
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="position" 
              name="position"
              type="text" 
              defaultValue={employeeData.position}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              Fecha de Inicio
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="startDate" 
              name="startDate"
              type="date"
              defaultValue={employeeData.startDate}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Teléfono
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="phone" 
              name="phone"
              type="tel" 
              defaultValue={employeeData.phone || ''}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Dirección
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="address" 
              name="address"
              type="text" 
              defaultValue={employeeData.address || ''}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emergencyContact">
              Contacto de Emergencia
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="emergencyContact" 
              name="emergencyContact"
              type="text" 
              defaultValue={employeeData.emergencyContact || ''}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notas
            </label>
            <textarea 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="notes" 
              name="notes"
              rows={3}
              defaultValue={employeeData.notes || ''}
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
              <a 
                href="/admin/employees" 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancelar
              </a>
              <button 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                type="button"
                onClick={handleDeleteEmployee}
              >
                Eliminar
              </button>
            </div>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
              type="submit"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
