'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

      // Generar ID único para el nuevo empleado
      const newEmployeeId = 'EMP' + Date.now().toString().slice(-6);
      
      // Crear objeto de empleado
      const newEmployee = {
        id: newEmployeeId,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        startDate: formData.startDate,
        status: 'active'
      };
      
      // Obtener empleados existentes del localStorage
      let employees = [];
      
      // Intentar obtener empleados existentes
      const storedEmployees = localStorage.getItem('timetracker_employees');
      
      if (storedEmployees) {
        try {
          // Intentar parsear los datos existentes
          employees = JSON.parse(storedEmployees);
          
          // Verificar que employees sea un array
          if (!Array.isArray(employees)) {
            console.error('Los datos almacenados no son un array:', employees);
            employees = [];
          }
        } catch (err) {
          console.error('Error al parsear empleados del localStorage:', err);
          employees = [];
        }
      } else {
        // Si no hay datos, inicializar con los empleados de muestra
        employees = getSampleEmployees();
      }
      
      // Añadir nuevo empleado
      employees.push(newEmployee);
      
      // Guardar en localStorage
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));
      
      // Mostrar mensaje de éxito y redirigir
      alert('Empleado añadido correctamente');
      router.push('/admin/employees');
    } catch (err) {
      console.error('Error al guardar empleado:', err);
      setError('Ocurrió un error al guardar el empleado');
      setIsSubmitting(false);
    }
  };

  // Función para obtener empleados de muestra
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
