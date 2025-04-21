'use client';

import React from 'react';

export default function AddEmployeePage() {
  // Función para guardar empleado
  const handleSaveEmployee = (e) => {
    e.preventDefault();
    alert('Empleado añadido correctamente');
    window.location.href = '/admin/employees';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Añadir Nuevo Empleado</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form id="addEmployeeForm" onSubmit={handleSaveEmployee}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nombre Completo
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="name" 
              type="text" 
              placeholder="Nombre y apellidos"
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
              placeholder="ejemplo@magneticplace.com"
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
              required
            >
              <option value="">Seleccionar departamento</option>
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
              placeholder="Cargo o posición"
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
              required
            />
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <a 
              href="/admin/employees" 
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancelar
            </a>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
              type="submit"
            >
              Guardar Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
