'use client';

// Simulación de un módulo de autenticación
export function useAuth() {
  // Simulación de un usuario autenticado
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
    login: () => console.log('Login simulado'),
    logout: () => console.log('Logout simulado')
  };
}
