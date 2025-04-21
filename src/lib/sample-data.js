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
  }
];

// Función para obtener clientes únicos
export function getUniqueClients() {
  const clients = sampleTimeRecords.map(record => record.clientTag).filter(Boolean);
  return [...new Set(clients)];
}
