'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';

export default function AddEmployeePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    joinDate: '',
    location: '',
    status: 'Activo',
    manager: '',
    address: '',
    birthDate: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
 const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

 const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'El nombre es obligatorio';
  }
  
  if (!formData.email.trim()) {
    newErrors.email = 'El email es obligatorio';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'El email no es válido';
  }
  
  if (!formData.phone.trim()) {
    newErrors.phone = 'El teléfono es obligatorio';
  }
  
  if (!formData.department.trim()) {
    newErrors.department = 'El departamento es obligatorio';
  }
  
  if (!formData.position.trim()) {
    newErrors.position = 'El cargo es obligatorio';
  }
  
  if (!formData.joinDate) {
    newErrors.joinDate = 'La fecha de incorporación es obligatoria';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulación de envío de datos
    setTimeout(() => {
      // En una aplicación real, aquí enviaríamos los datos al servidor
      console.log('Datos del formulario:', formData);
      
      // Generar ID único para el nuevo empleado (en una app real, esto lo haría el backend)
      const newEmployeeId = 'EMP' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      alert(`Empleado añadido correctamente con ID: ${newEmployeeId}`);
      
      // Redirigir a la lista de empleados
      router.push('/admin/employees');
      
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCancel = () => {
    router.back();
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
        <div className="mb-6 flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Añadir Nuevo Empleado</h1>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Personal</h2>
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Laboral</h2>
                
                <div className="mb-4">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.department ? 'border-red-500' : ''
                    }`}
                    value={formData.department}
                    onChange={handleChange}
                  />
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.position ? 'border-red-500' : ''
                    }`}
                    value={formData.position}
                    onChange={handleChange}
                  />
                  {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Incorporación *
                  </label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.joinDate ? 'border-red-500' : ''
                    }`}
                    value={formData.joinDate}
                    onChange={handleChange}
                  />
                  {errors.joinDate && <p className="text-red-500 text-xs mt-1">{errors.joinDate}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Baja Temporal">Baja Temporal</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    id="manager"
                    name="manager"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.manager}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contacto de Emergencia</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Relación
                  </label>
                  <input
                    type="text"
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Etiquetas</h2>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Ej: Proyecto A, Frontend, Tiempo Completo"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Empleado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
