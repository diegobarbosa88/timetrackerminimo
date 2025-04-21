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
    startDate: '',
    phone: '',
    address: '',
    emergencyContact: '',
    notes: '',
    password: '' // Añadido campo para contraseña
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
      // Validar datos obligatorios
      if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.startDate || !formData.password) {
        setError('Por favor, completa todos los campos obligatorios');
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
        status: 'active',
        phone: formData.phone || 'No disponible',
        address: formData.address || 'No disponible',
        emergencyContact: formData.emergencyContact || 'No disponible',
        notes: formData.notes || 'No disponible',
        password: formData.password, // Guardar contraseña para inicio de sesión
        timeRecords: [] // Inicializar con array vacío de registros de tiempo
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
        status: 'active',
        password: 'emp123', // Contraseña para inicio de sesión
        phone: '555-1234',
        address: 'Calle Principal 123',
        emergencyContact: 'Ana Rodríguez - 555-5678',
        notes: 'Empleado del mes en enero 2023'
      },
      {
        id: 'EMP002',
        name: 'Ana Martínez',
        email: 'ana@example.com',
        department: 'Administración',
        position: 'Contadora',
        startDate: '2023-02-10',
        status: 'active',
        password: 'emp123',
        phone: '555-2345',
        address: 'Avenida Central 456',
        emergencyContact: 'Juan Martínez - 555-6789',
        notes: 'Certificada en contabilidad avanzada'
      },
      {
        id: 'EMP003',
        name: 'Miguel Sánchez',
        email: 'miguel@example.com',
        department: 'Ventas',
        position: 'Representante de Ventas',
        startDate: '2023-03-05',
        status: 'active',
        password: 'emp123',
        phone: '555-3456',
        address: 'Calle Comercial 789',
        emergencyContact: 'Laura Sánchez - 555-7890',
        notes: 'Superó meta de ventas en Q1 2023'
      },
      {
        id: 'EMP004',
        name: 'Laura Gómez',
        email: 'laura@example.com',
        department: 'Tecnología',
        position: 'Desarrolladora Frontend',
        startDate: '2023-04-12',
        status: 'active',
        password: 'emp123',
        phone: '555-4567',
        address: 'Calle Tecnológica 101',
        emergencyContact: 'Carlos Gómez - 555-8901',
        notes: 'Experta en React y Next.js'
      },
      {
        id: 'EMP005',
        name: 'Javier López',
        email: 'javier@example.com',
        department: 'Recursos Humanos',
        position: 'Coordinador de RRHH',
        startDate: '2023-05-20',
        status: 'active',
        password: 'emp123',
        phone: '555-5678',
        address: 'Avenida Principal 202',
        emergencyContact: 'María López - 555-9012',
        notes: 'Certificado en gestión de talento'
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
          <div className="mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Nombre Completo *
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
                  Email *
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
                  Departamento *
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
                  Cargo *
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
                  Fecha de Inicio *
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
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Contraseña para Inicio de Sesión *
                </label>
                <input 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="password" 
                  type="password"
                  placeholder="Contraseña para el empleado"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Esta contraseña permitirá al empleado iniciar sesión y registrar sus horas.</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Teléfono
                </label>
                <input 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="phone" 
                  type="text" 
                  placeholder="Número de teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Dirección
                </label>
                <input 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="address" 
                  type="text" 
                  placeholder="Dirección completa"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emergencyContact">
                  Contacto de Emergencia
                </label>
                <input 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="emergencyContact" 
                  type="text" 
                  placeholder="Nombre y teléfono"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Información Adicional</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                Notas
              </label>
              <textarea 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="notes" 
                placeholder="Información adicional sobre el empleado"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
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
