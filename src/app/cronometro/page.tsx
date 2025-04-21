'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';

export default function CronometroPage() {
  const { user, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [timer, setTimer] = useState('00:00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedClient, setSelectedClient] = useState('MAGNETIC PLACE');
  
  // Lista de clientes (en una aplicación real, esto vendría de una API o base de datos)
  const clients = [
    'MAGNETIC PLACE',
    'Cliente A',
    'Cliente B',
    'Cliente C'
  ];

  // Actualizar hora y fecha actual
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Formatear hora actual (HH:MM:SS)
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      // Formatear fecha actual (día de la semana, día de mes de año)
      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      
      const dayOfWeek = days[now.getDay()];
      const dayOfMonth = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      
      setCurrentDate(`Hoy es ${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`);
    };
    
    // Actualizar inmediatamente y luego cada segundo
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Manejar el cronómetro
  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const newElapsedTime = elapsedTime + (now - startTime);
        setStartTime(now);
        setElapsedTime(newElapsedTime);
        
        // Formatear tiempo transcurrido
        const totalSeconds = Math.floor(newElapsedTime / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        
        setTimer(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning, startTime, elapsedTime]);
  
  // Iniciar o pausar el cronómetro
  const toggleTimer = () => {
    if (!isRunning) {
      // Iniciar el cronómetro
      setStartTime(Date.now());
      setIsRunning(true);
      
      // Guardar en localStorage o enviar a la API (en una implementación real)
      const startRecord = {
        userId: user?.id,
        clientId: selectedClient,
        startTime: new Date().toISOString(),
        date: new Date().toLocaleDateString()
      };
      
      // Simulación de guardado
      console.log('Inicio de jornada registrado:', startRecord);
      localStorage.setItem('currentTimeRecord', JSON.stringify(startRecord));
    } else {
      // Pausar el cronómetro
      setIsRunning(false);
      
      // Guardar en localStorage o enviar a la API (en una implementación real)
      const endRecord = {
        userId: user?.id,
        clientId: selectedClient,
        endTime: new Date().toISOString(),
        elapsedTime: elapsedTime,
        date: new Date().toLocaleDateString()
      };
      
      // Simulación de guardado
      console.log('Fin de jornada registrado:', endRecord);
      localStorage.removeItem('currentTimeRecord');
      
      // Reiniciar el cronómetro
      setTimer('00:00:00');
      setElapsedTime(0);
    }
  };
  
  // Verificar si hay una jornada en progreso al cargar la página
  useEffect(() => {
    const savedRecord = localStorage.getItem('currentTimeRecord');
    if (savedRecord) {
      try {
        const record = JSON.parse(savedRecord);
        const savedStartTime = new Date(record.startTime).getTime();
        const now = Date.now();
        const savedElapsedTime = now - savedStartTime;
        
        setSelectedClient(record.clientId);
        setStartTime(now);
        setElapsedTime(savedElapsedTime);
        setIsRunning(true);
        
        // Formatear tiempo transcurrido
        const totalSeconds = Math.floor(savedElapsedTime / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        
        setTimer(`${hours}:${minutes}:${seconds}`);
      } catch (error) {
        console.error('Error al cargar el registro de tiempo guardado:', error);
        localStorage.removeItem('currentTimeRecord');
      }
    }
  }, []);
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Debes iniciar sesión para acceder a esta página</p>
          <a href="/auth/login" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cronómetro</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-700">Hora actual: <span className="font-semibold">{currentTime}</span></p>
            <p className="text-gray-700">Bienvenido, <span className="font-semibold">{user?.name || 'Usuario'}</span></p>
            <p className="text-gray-700">{currentDate}</p>
          </div>
          <div className="flex items-start justify-end">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-200 text-gray-700">
              <span className="w-2 h-2 mr-2 rounded-full bg-gray-500"></span>
              {isRunning ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="client" className="block text-gray-700 mb-2">Cliente</label>
          <select
            id="client"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={isRunning}
          >
            {clients.map((client) => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-8">{timer}</div>
          
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center px-6 py-3 rounded-md text-white font-medium ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              {isRunning ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              )}
            </svg>
            {isRunning ? 'Finalizar Jornada' : 'Iniciar Jornada'}
          </button>
        </div>
      </div>
    </div>
  );
}
