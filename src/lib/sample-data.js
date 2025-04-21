// Datos de ejemplo para los registros de tiempo
export const sampleTimeRecords = [
  {
    id: 'TR001',
    userId: 'EMP001',
    date: '2024-04-20',
    startTime: '08:30',
    endTime: '17:45',
    totalWorkTime: 555, // en minutos
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR002',
    userId: 'EMP001',
    date: '2024-04-19',
    startTime: '08:15',
    endTime: '17:30',
    totalWorkTime: 555,
    clientTag: 'Cliente B',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR003',
    userId: 'EMP001',
    date: '2024-04-18',
    startTime: '08:45',
    endTime: '18:00',
    totalWorkTime: 555,
    clientTag: 'Cliente A',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR004',
    userId: 'EMP002',
    date: '2024-04-20',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR005',
    userId: 'EMP002',
    date: '2024-04-19',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  }
];

// Función para obtener clientes únicos
export function getUniqueClients() {
  const clients = sampleTimeRecords.map(record => record.clientTag).filter(Boolean);
  return [...new Set(clients)];
}

// Definición de tipos para TypeScript usando JSDoc
/**
 * @typedef {Object} TimeRecord
 * @property {string} id - Identificador único del registro
 * @property {string} userId - ID del empleado
 * @property {string} date - Fecha del registro (formato YYYY-MM-DD)
 * @property {string} startTime - Hora de entrada
 * @property {string} [endTime] - Hora de salida (opcional)
 * @property {number} [totalWorkTime] - Tiempo total trabajado en minutos (opcional)
 * @property {string} [clientTag] - Etiqueta del cliente (opcional)
 * @property {boolean} usedEntryTolerance - Si se usó tolerancia en la entrada
 * @property {boolean} usedExitTolerance - Si se usó tolerancia en la salida
 */

// No se usa la palabra clave 'interface' que solo es válida en archivos .ts
