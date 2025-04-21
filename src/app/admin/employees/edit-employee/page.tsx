'use client';

import React, { useEffect, useState } from 'react';

export default function EditEmployeePage() {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeData, setEmployeeData] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    status: '',
    statusClass: ''
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
          statusClass: 'bg-green-100 text-green-800'
        },
        'EMP002': {
          id: 'EMP002',
          name: 'Ana Martínez',
          email: 'ana.martinez@magneticplace.com',
          department: 'Administración',
          position: 'Gerente Administrativa',
          startDate: '2022-11-10',
          status: 'Registrada (08:15)',
          statusClass: 'bg-green-100 text-green-800'
        },
        'EMP003': {
          id: 'EMP003',
          name: 'Miguel Sánchez',
          email: 'miguel.sanchez@magneticplace.com',
          department: 'Ventas',
          position: 'Representante de Ventas',
          startDate: '2024-01-20',
          status: 'No registrado',
          statusClass: 'bg-red-100 text-red-800'
        }
      };
      
      if (employeeMap[id]) {
        setEmployeeData(employeeMap[id]);
      }
    }
  }, []);

  // Función para eliminar empleado
  const handleDeleteEmployee = () => {
    if (confirm('¿Está seguro que desea eliminar este empleado? Esta acción no se puede deshacer.')) {
      alert(`Empleado ${employeeData.name} (${employeeId}) eliminado correctamente`);
      window.location.href = '/admin/employees';
    }
  };

  // Función para guardar cambios
  const handleSaveChanges = () => {
    alert(`Cambios guardados correctamente para ${employeeData.name} (${employeeId})`);
    window.location.href = '/admin/employees';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Editar Empleado</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form id="editEmployeeForm" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
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
              defaultValue={employeeData.department}
              required
            >
              <option value="Operaciones">Operaciones</option>
              <option value="Administración">Administración</option>
              <option value="Ventas">Ventas</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
              Cargo
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="position" 
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
              type="date"
              defaultValue={employeeData.startDate}
              required
            />
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
