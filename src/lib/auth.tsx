'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Definir el contexto de autenticación
const AuthContext = createContext(undefined);

// Proveedor de autenticación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Función de inicio de sesión
  const login = async (credentials) => {
    setLoading(true);
    
    try {
      // Verificación de credenciales
      let isValid = false;
      let userData = null;
      
      if (credentials.type === 'admin' && credentials.email) {
        // Datos de administrador para simulación (en una aplicación real, esto vendría de una base de datos)
        const ADMIN_USER = {
          id: 'ADMIN001',
          name: 'Administrador',
          email: 'admin@magneticplace.com',
          password: 'admin123',
          role: 'admin'
        };
        
        isValid = 
          credentials.email === ADMIN_USER.email && 
          credentials.password === ADMIN_USER.password;
        
        if (isValid) {
          userData = {
            id: ADMIN_USER.id,
            name: ADMIN_USER.name,
            email: ADMIN_USER.email,
            role: 'admin'
          };
        }
      } else if (credentials.type === 'employee' && credentials.employeeId) {
        // Buscar el empleado en localStorage
        const storedEmployees = localStorage.getItem('timetracker_employees');
        if (storedEmployees) {
          const employees = JSON.parse(storedEmployees);
          const employee = employees.find(emp => emp.id === credentials.employeeId);
          
          if (employee && employee.password === credentials.password) {
            isValid = true;
            userData = {
              id: employee.id,
              name: employee.name,
              email: employee.email,
              role: 'employee',
              department: employee.department,
              position: employee.position
            };
          }
        }
      }
      
      if (isValid && userData) {
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        // Redirigir al dashboard después de iniciar sesión exitosamente
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función de cierre de sesión
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  // Verificar si el usuario tiene el rol requerido
  const checkRole = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === 'any') return true;
    return user.role === requiredRole;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    checkRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Componente de protección de rutas
export function withAuth(Component, requiredRole = 'any') {
  return function ProtectedRoute(props) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/auth/login');
      } else if (!loading && isAuthenticated && requiredRole !== 'any') {
        if (user?.role !== requiredRole) {
          // Redirigir a una página de acceso denegado o al dashboard
          router.push('/dashboard');
        }
      }
    }, [loading, isAuthenticated, user, router]);

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

    if (!isAuthenticated) {
      return null; // No renderizar nada mientras se redirige
    }

    if (requiredRole !== 'any' && user?.role !== requiredRole) {
      return null; // No renderizar nada mientras se redirige
    }

    return <Component {...props} />;
  };
}
