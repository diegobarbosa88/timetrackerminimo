'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';

export default function LoginPage() {
  const [userType, setUserType] = useState(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  const handleSelectUserType = (type) => {
    setUserType(type);
  };
  
  const handleBackToSelection = () => {
    setUserType(null);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TimeTracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de seguimiento de tiempo para empleados
          </p>
        </div>
        
        {userType === null ? (
          // Pantalla de selección de tipo de usuario
          <div className="mt-8 space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Selecciona tipo de usuario</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleSelectUserType('admin')}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Administrador
              </button>
              <button
                onClick={() => handleSelectUserType('employee')}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Empleado
              </button>
            </div>
          </div>
        ) : userType === 'admin' ? (
          // Formulario de inicio de sesión para administradores
          <AdminLoginForm onBack={handleBackToSelection} />
        ) : (
          // Formulario de inicio de sesión para empleados
          <EmployeeLoginForm onBack={handleBackToSelection} />
        )}
      </div>
    </div>
  );
}

function AdminLoginForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Usar la función login del contexto de autenticación
      const success = await login({
        type: 'admin',
        email,
        password
      });
      
      if (success) {
        // Redirección explícita al dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Inicio de sesión - Administrador</h3>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="admin-email" className="sr-only">Correo electrónico</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="sr-only">Contraseña</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onBack}
            className="group relative w-1/3 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-2/3 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EmployeeLoginForm({ onBack }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Usar la función login del contexto de autenticación
      const success = await login({
        type: 'employee',
        employeeId,
        password
      });
      
      if (success) {
        // Redirección explícita al dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Inicio de sesión - Empleado</h3>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="employee-id" className="sr-only">ID de Empleado</label>
            <input
              id="employee-id"
              name="employeeId"
              type="text"
              autoComplete="username"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="ID de Empleado"
            />
          </div>
          <div>
            <label htmlFor="employee-password" className="sr-only">Contraseña</label>
            <input
              id="employee-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="font-medium text-green-600 hover:text-green-500">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onBack}
            className="group relative w-1/3 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-2/3 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </div>
      </form>
    </div>
  );
}
