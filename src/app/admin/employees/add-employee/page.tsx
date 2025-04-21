'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveEmployee } from '@/lib/sample-data';

export default function AddEmployeePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  // Función para guardar empleado
  const handleSaveEmployee = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validar datos
      if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.startDate) {
        setError('Por favor, completa todos los campos');
        setIsSubmitting(false);
        return;
      }

      // Guardar empleado usando la función de sample-data.js
      const result = saveEmployee(formData);
      
      if (result.success) {
        // Mostrar mensaje de éxito y redirigir
        alert('Empleado añadido correctamente');
        router.push('/admin/employees');
      } else {
        setError(result.error || 'Error al guardar el empleado');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error al guardar empleado:', err);
      setError('Ocurrió un error al guardar el empleado');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Añadir Nuevo Empleado</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
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
              value={formData.name}
              onChange={handleChange}
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
              value={formData.email}
              onChange={handleChange}
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
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar departamento</option>
              <option value="Operaciones">Operaciones</option>
              <option value="Administración">Administración</option>
              <option value="Ventas">Ventas</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
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
              value={formData.position}
              onChange={handleChange}
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
              value={formData.startDate}
              onChange={handleChange}
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
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
