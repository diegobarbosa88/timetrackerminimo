'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">TimeTracker</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de seguimiento de tiempo para empleados
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/auth/login" 
                className="btn-primary px-6 py-3 text-base"
              >
                Iniciar Sesión
              </a>
              <button 
                onClick={() => router.push('/auth/login')}
                className="btn-secondary px-6 py-3 text-base"
              >
                Conocer Más
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/dashboard" 
                className="btn-primary px-6 py-3 text-base"
              >
                Ir al Dashboard
              </a>
              {user?.role === 'admin' && (
                <a 
                  href="/admin/employees" 
                  className="btn-secondary px-6 py-3 text-base"
                >
                  Gestionar Empleados
                </a>
              )}
            </div>
          )}
        </div>
        
        {/* Features Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-blue-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Control de Tiempo</h3>
              <p className="text-gray-600">
                Registra entradas y salidas de empleados con precisión y facilidad.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-green-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Informes Detallados</h3>
              <p className="text-gray-600">
                Genera informes de asistencia, horas trabajadas y rendimiento.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-purple-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Empleados</h3>
              <p className="text-gray-600">
                Administra perfiles, departamentos y permisos de empleados.
              </p>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="bg-blue-50 rounded-lg p-8 text-center my-12">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-blue-600 mb-6">
              Comienza a gestionar el tiempo de tus empleados de manera eficiente.
            </p>
            <a 
              href="/auth/login" 
              className="btn-primary px-6 py-3 text-base"
            >
              Iniciar Sesión
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
