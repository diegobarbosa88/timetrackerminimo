'use client';

import React, { useEffect, useState } from 'react';

// Definir interfaces para TypeScript
interface TimeRecord {
  date: string;
  entry: string;
  exit: string;
  total: string;
  status: string;
  isSimulated?: boolean;
}

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  startDate: string;
  status: string;
  statusClass: string;
  phone: string;
  address: string;
  emergencyContact: string;
  notes: string;
  timeRecords?: TimeRecord[];
}

interface EmployeeStats {
  hoursThisMonth: string;
  daysWorked: number;
  punctuality: string;
  extraHours: string;
}

export default function ViewEmployeePage() {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    status: 'No disponible',
    statusClass: 'bg-gray-100 text-gray-800',
    phone: 'No disponible',
    address: 'No disponible',
    emergencyContact: 'No disponible',
    notes: 'No disponible'
  });
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulatedData, setIsSimulatedData] = useState<boolean>(true);

  // Obtener el ID del empleado de la URL al cargar la página
  useEffect(() => {
    // Función para obtener parámetros de la URL
    const getQueryParam = (param: string): string | null => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };

    const id = getQueryParam('id');
    if (id) {
      setEmployeeId(id);
      
      // Intentar obtener el empleado seleccionado de localStorage
      try {
        const selectedEmployeeJson = localStorage.getItem('selected_employee');
        if (selectedEmployeeJson) {
          const selectedEmployee = JSON.parse(selectedEmployeeJson);
          
          // Verificar que el ID coincida
          if (selectedEmployee && selectedEmployee.id === id) {
            // Crear objeto de datos completo con la información disponible
            const employeeInfo = {
              ...employeeData,
              ...selectedEmployee,
              status: selectedEmployee.status || 'Activo',
              statusClass: 'bg-green-100 text-green-800',
            };
            
            setEmployeeData(employeeInfo);
            
            // Verificar si el empleado tiene registros de tiempo reales
            if (selectedEmployee.timeRecords && selectedEmployee.timeRecords.length > 0) {
              setTimeRecords(selectedEmployee.timeRecords);
              setIsSimulatedData(false);
            } else {
              // Si no tiene registros reales, cargar datos simulados
              loadTimeRecords(id);
              setIsSimulatedData(true);
            }
          } else {
            // Si el ID no coincide, buscar en la lista completa de empleados
            loadEmployeeFromList(id);
          }
        } else {
          // Si no hay empleado seleccionado, buscar en la lista completa
          loadEmployeeFromList(id);
        }
      } catch (error) {
        console.error('Error al cargar datos del empleado:', error);
        loadEmployeeFromList(id);
      }
    }
    
    setLoading(false);
  }, []);

  // Función para cargar empleado desde la lista completa
  const loadEmployeeFromList = (employeeId: string): void => {
    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        const employees = JSON.parse(storedEmployees);
        const employee = employees.find((emp: any) => emp.id === employeeId);
        
        if (employee) {
          const employeeInfo = {
            ...employeeData,
            ...employee,
            status: employee.status || 'Activo',
            statusClass: 'bg-green-100 text-green-800',
          };
          
          setEmployeeData(employeeInfo);
          
          // Verificar si el empleado tiene registros de tiempo reales
          if (employee.timeRecords && employee.timeRecords.length > 0) {
            setTimeRecords(employee.timeRecords);
            setIsSimulatedData(false);
          } else {
            // Si no tiene registros reales, cargar datos simulados
            loadTimeRecords(employeeId);
            setIsSimulatedData(true);
          }
        } else {
          // Si no se encuentra el empleado, cargar datos simulados
          loadTimeRecords(employeeId);
          setIsSimulatedData(true);
        }
      } else {
        // Si no hay empleados almacenados, cargar datos simulados
        loadTimeRecords(employeeId);
        setIsSimulatedData(true);
      }
    } catch (error) {
      console.error('Error al buscar empleado en la lista:', error);
      // En caso de error, cargar datos simulados
      loadTimeRecords(employeeId);
      setIsSimulatedData(true);
    }
  };

  // Función para cargar registros de tiempo simulados
  const loadTimeRecords = (employeeId: string): void => {
    // En una aplicación real, estos datos vendrían de una API o base de datos
    // Por ahora, generamos datos de ejemplo para el último mes
    const records: TimeRecord[] = [];
    const today = new Date();
    
    // Generar registros para los últimos 30 días
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Solo incluir días laborables (lunes a viernes)
      if (date.getDay() > 0 && date.getDay() < 6) {
        // Generar hora de entrada aleatoria entre 8:00 y 9:00
        const entryHour = Math.floor(Math.random() * 2) + 8;
        const entryMinute = Math.floor(Math.random() * 60);
        const entryTime = `${entryHour.toString().padStart(2, '0')}:${entryMinute.toString().padStart(2, '0')}`;
        
        // Generar hora de salida aleatoria entre 17:00 y 18:30
        const exitHour = Math.floor(Math.random() * 2) + 17;
        const exitMinute = Math.floor(Math.random() * 60);
        const exitTime = `${exitHour.toString().padStart(2, '0')}:${exitMinute.toString().padStart(2, '0')}`;
        
        // Calcular horas trabajadas
        const entryMinutes = entryHour * 60 + entryMinute;
        const exitMinutes = exitHour * 60 + exitMinute;
        const totalMinutes = exitMinutes - entryMinutes;
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        const totalTime = `${totalHours}h ${remainingMinutes}m`;
        
        // Determinar estado (llegada tarde si después de las 8:30)
        const status = entryHour > 8 || (entryHour === 8 && entryMinute > 30) ? 'Llegada tarde' : 'Completado';
        
        records.push({
          date: date.toISOString().split('T')[0],
          entry: entryTime,
          exit: exitTime,
          total: totalTime,
          status: status,
          isSimulated: true
        });
      }
    }
    
    // Ordenar registros por fecha (más reciente primero)
    records.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    setTimeRecords(records);
  };

  // Calcular estadísticas basadas en los registros de tiempo
  const calculateStats = (): EmployeeStats => {
    if (timeRecords.length === 0) {
      return {
        hoursThisMonth: '0h 0m',
        daysWorked: 0,
        punctuality: '0%',
        extraHours: '0h 0m'
      };
    }
    
    // Total de minutos trabajados
    let totalMinutes = 0;
    let lateCount = 0;
    let extraMinutes = 0;
    
    timeRecords.forEach(record => {
      // Extraer horas y minutos del total
      const [hours, minutes] = record.total.split('h ');
      const recordMinutes = parseInt(hours) * 60 + parseInt(minutes.replace('m', ''));
      
      totalMinutes += recordMinutes;
      
      // Contar llegadas tarde
      if (record.status === 'Llegada tarde') {
        lateCount++;
      }
      
      // Calcular horas extra (más de 8 horas)
      const extraInRecord = Math.max(0, recordMinutes - 480); // 8 horas = 480 minutos
      extraMinutes += extraInRecord;
    });
    
    // Calcular estadísticas
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    const extraHours = Math.floor(extraMinutes / 60);
    const extraRemainingMinutes = extraMinutes % 60;
    
    const punctuality = Math.round(((timeRecords.length - lateCount) / timeRecords.length) * 100);
    
    return {
      hoursThisMonth: `${totalHours}h ${remainingMinutes}m`,
      daysWorked: timeRecords.length,
      punctuality: `${punctuality}%`,
      extraHours: `${extraHours}h ${extraRemainingMinutes}m`
    };
  };

  const employeeStats = calculateStats();

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Cargando información del empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles del Empleado</h1>
        <div className="flex space-x-2">
          <a 
            href="/admin/employees" 
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Volver
          </a>
          <a 
            href={`/admin/employees/edit-employee?id=${employeeId}`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Editar
          </a>
        </div>
      </div>
      
      {/* Información básica */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{employeeData.name}</h2>
            <p className="text-gray-600">{employeeData.position} - {employeeData.department}</p>
            <div className="mt-1">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${employeeData.statusClass}`}>
                {employeeData.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Información de Contacto</h3>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {employeeData.id}</p>
              <p><span className="font-medium">Email:</span> {employeeData.email}</p>
              <p><span className="font-medium">Teléfono:</span> {employeeData.phone}</p>
              <p><span className="font-medium">Dirección:</span> {employeeData.address}</p>
              <p><span className="font-medium">Contacto de Emergencia:</span> {employeeData.emergencyContact}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Información Laboral</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Departamento:</span> {employeeData.department}</p>
              <p><span className="font-medium">Cargo:</span> {employeeData.position}</p>
              <p><span className="font-medium">Fecha de Inicio:</span> {employeeData.startDate ? formatDate(employeeData.startDate) : 'No disponible'}</p>
              <p><span className="font-medium">Notas:</span> {employeeData.notes}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estadísticas laborales */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Estadísticas Laborales (Mes Actual)</h3>
          {isSimulatedData && (
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Datos simulados para demostración
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Horas Trabajadas</h4>
            <p className="text-2xl font-bold text-blue-600">{employeeStats.hoursThisMonth}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Días Trabajados</h4>
            <p className="text-2xl font-bold text-green-600">{employeeStats.daysWorked} días</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Puntualidad</h4>
            <p className="text-2xl font-bold text-purple-600">{employeeStats.punctuality}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800">Horas Extra</h4>
            <p className="text-2xl font-bold text-yellow-600">{employeeStats.extraHours}</p>
          </div>
        </div>
      </div>
      
      {/* Historial de registros */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Historial de Registros Recientes</h3>
          {isSimulatedData && (
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Datos simulados para demostración
            </div>
          )}
        </div>
        
        {isSimulatedData && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
            <p className="font-bold">Información</p>
            <p>Los registros mostrados son datos simulados para fines de demostración. Este empleado aún no tiene registros de tiempo reales en el sistema.</p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeRecords.length > 0 ? (
                timeRecords.slice(0, 5).map((record, index) => (
                  <tr key={index} className={record.isSimulated ? "bg-blue-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.entry}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.exit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay registros disponibles para este empleado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <a 
            href={`/reports?employeeId=${employeeId}`}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            Ver todos los registros →
          </a>
        </div>
      </div>
    </div>
  );
}
