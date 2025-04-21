'use client';

import React from 'react';
import './globals.css';
import { AuthProvider } from '../lib/auth';

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
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <style jsx global>{`
          body {
            background-color: #f5f7fa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .card {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .btn-primary {
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-weight: 600;
            transition: background-color 0.2s;
          }
          .btn-primary:hover {
            background-color: #2563eb;
          }
          .btn-secondary {
            background-color: #e5e7eb;
            color: #1f2937;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-weight: 600;
            transition: background-color 0.2s;
          }
          .btn-secondary:hover {
            background-color: #d1d5db;
          }
          .metric-card {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            padding: 1.25rem;
            margin-bottom: 1rem;
          }
          .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #3b82f6;
          }
          .metric-label {
            font-size: 0.875rem;
            color: #6b7280;
          }
          .nav-link {
            color: #4b5563;
            transition: color 0.2s;
          }
          .nav-link:hover {
            color: #3b82f6;
          }
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <Header />
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
        </AuthProvider>
      </body>
    </html>
  );
}

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 font-bold text-xl">TimeTracker</span>
            </div>
            <nav className="ml-6 flex items-center space-x-8">
              <a href="/" className="nav-link px-3 py-2 text-sm font-medium">Inicio</a>
              {isAuthenticated && (
                <>
                  <a href="/dashboard" className="nav-link px-3 py-2 text-sm font-medium">Dashboard</a>
                  <a href="/cronometro" className="nav-link px-3 py-2 text-sm font-medium">Cronómetro</a>
                  {user?.role === 'admin' && (
                    <a href="/admin/employees" className="nav-link px-3 py-2 text-sm font-medium">Empleados</a>
                  )}
                  <a href="/reports" className="nav-link px-3 py-2 text-sm font-medium">Informes</a>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 nav-link px-3 py-2 text-sm font-medium"
                >
                  <span>{user?.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500">{user?.email}</div>
                      <div className="text-xs mt-1 bg-gray-100 inline-block px-2 py-1 rounded">
                        {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
                      </div>
                    </div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</a>
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/auth/login" className="nav-link px-3 py-2 text-sm font-medium">
                Iniciar Sesión
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Importar useAuth después de definir Header para evitar problemas de referencia
import { useAuth } from '../lib/auth';
