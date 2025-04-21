'use client';

// Simulación de autenticación
export const useAuth = () => {
  // Simulación de usuario autenticado
  const user = {
    id: 'EMP001',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@magneticplace.com',
    role: 'admin'
  };

  return {
    user,
    isAuthenticated: true,
    loading: false,
    login: (email, password) => {
      console.log('Login simulado con:', email, password);
      return Promise.resolve(true);
    },
    logout: () => {
      console.log('Logout simulado');
      return Promise.resolve(true);
    }
  };
};
