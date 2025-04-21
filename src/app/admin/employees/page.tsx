'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, withAuth } from '../../../lib/auth';

// Componente protegido que solo pueden ver los administradores
function AdminEmployeesPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
        <a 
          href="/admin/employees/add-employee" 
          className="btn-primary"
        >
          Añadir Empleado
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">EMP001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Carlos Rodríguez</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Operaciones</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Técnico Senior</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href={`/admin/employees/view-employee?id=EMP001`} className="text-blue-600 hover:text-blue-900 mr-3">Ver</a>
                  <a href={`/admin/employees/edit-employee?id=EMP001`} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">EMP002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ana Martínez</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Administración</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Gerente Administrativa</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href={`/admin/employees/view-employee?id=EMP002`} className="text-blue-600 hover:text-blue-900 mr-3">Ver</a>
                  <a href={`/admin/employees/edit-employee?id=EMP002`} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">EMP003</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Miguel Sánchez</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ventas</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Representante de Ventas</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href={`/admin/employees/view-employee?id=EMP003`} className="text-blue-600 hover:text-blue-900 mr-3">Ver</a>
                  <a href={`/admin/employees/edit-employee?id=EMP003`} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Exportar el componente con protección de rol 'admin'
export default withAuth(AdminEmployeesPage, 'admin');
