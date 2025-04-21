'use client';

import React from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <title>TimeTracker - MAGNETIC PLACE</title>
        <meta name="description" content="Sistema de seguimiento de tiempo para empleados" />
      </head>
      <body>
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-blue-600 font-bold text-xl">TimeTracker</span>
                </div>
                <nav className="ml-6 flex items-center space-x-8">
                  <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Inicio</a>
                  <a href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Dashboard</a>
                  <a href="/admin/employees" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Empleados</a>
                  <a href="/reports" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Informes</a>
                </nav>
              </div>
              <div className="flex items-center">
                <a href="/auth/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Mi Cuenta
                </a>
              </div>
            </div>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="bg-white mt-12 py-6 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} TimeTracker - MAGNETIC PLACE. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
