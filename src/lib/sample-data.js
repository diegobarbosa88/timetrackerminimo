// Datos de ejemplo para los empleados
export const sampleEmployees = [
  {
    id: 'EMP001',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@magneticplace.com',
    department: 'Operaciones',
    position: 'Técnico Senior',
    startDate: '2023-03-15',
    status: 'active'
  },
  {
    id: 'EMP002',
    name: 'Ana Martínez',
    email: 'ana.martinez@magneticplace.com',
    department: 'Administración',
    position: 'Gerente Administrativa',
    startDate: '2023-02-01',
    status: 'active'
  },
  {
    id: 'EMP003',
    name: 'Miguel Sánchez',
    email: 'miguel.sanchez@magneticplace.com',
    department: 'Ventas',
    position: 'Representante de Ventas',
    startDate: '2023-05-10',
    status: 'inactive'
  },
  {
    id: 'EMP004',
    name: 'Laura Gómez',
    email: 'laura.gomez@magneticplace.com',
    department: 'Operaciones',
    position: 'Analista de Operaciones',
    startDate: '2023-01-05',
    status: 'active'
  },
  {
    id: 'EMP005',
    name: 'Javier López',
    email: 'javier.lopez@magneticplace.com',
    department: 'Ventas',
    position: 'Director Comercial',
    startDate: '2023-02-15',
    status: 'active'
  }
];

// Datos de ejemplo para los registros de tiempo (ampliados con historial de 1 mes)
export const sampleTimeRecords = [
  // Registros para Carlos Rodríguez (EMP001) - Último mes
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
    userId: 'EMP001',
    date: '2024-04-17',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR005',
    userId: 'EMP001',
    date: '2024-04-16',
    startTime: '08:20',
    endTime: '17:40',
    totalWorkTime: 560,
    clientTag: 'Cliente B',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR006',
    userId: 'EMP001',
    date: '2024-04-15',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR007',
    userId: 'EMP001',
    date: '2024-04-12',
    startTime: '08:40',
    endTime: '17:50',
    totalWorkTime: 550,
    clientTag: 'Cliente B',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR008',
    userId: 'EMP001',
    date: '2024-04-11',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR009',
    userId: 'EMP001',
    date: '2024-04-10',
    startTime: '08:15',
    endTime: '17:45',
    totalWorkTime: 570,
    clientTag: 'Cliente B',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR010',
    userId: 'EMP001',
    date: '2024-04-09',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR011',
    userId: 'EMP001',
    date: '2024-04-08',
    startTime: '08:45',
    endTime: '18:00',
    totalWorkTime: 555,
    clientTag: 'Cliente B',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR012',
    userId: 'EMP001',
    date: '2024-04-05',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR013',
    userId: 'EMP001',
    date: '2024-04-04',
    startTime: '08:20',
    endTime: '17:40',
    totalWorkTime: 560,
    clientTag: 'Cliente B',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR014',
    userId: 'EMP001',
    date: '2024-04-03',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR015',
    userId: 'EMP001',
    date: '2024-04-02',
    startTime: '08:40',
    endTime: '17:50',
    totalWorkTime: 550,
    clientTag: 'Cliente B',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR016',
    userId: 'EMP001',
    date: '2024-04-01',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR017',
    userId: 'EMP001',
    date: '2024-03-29',
    startTime: '08:15',
    endTime: '17:45',
    totalWorkTime: 570,
    clientTag: 'Cliente B',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR018',
    userId: 'EMP001',
    date: '2024-03-28',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR019',
    userId: 'EMP001',
    date: '2024-03-27',
    startTime: '08:45',
    endTime: '18:00',
    totalWorkTime: 555,
    clientTag: 'Cliente B',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR020',
    userId: 'EMP001',
    date: '2024-03-26',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente A',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  
  // Registros para Ana Martínez (EMP002) - Último mes
  {
    id: 'TR021',
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
    id: 'TR022',
    userId: 'EMP002',
    date: '2024-04-19',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR023',
    userId: 'EMP002',
    date: '2024-04-18',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR024',
    userId: 'EMP002',
    date: '2024-04-17',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR025',
    userId: 'EMP002',
    date: '2024-04-16',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR026',
    userId: 'EMP002',
    date: '2024-04-15',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR027',
    userId: 'EMP002',
    date: '2024-04-12',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR028',
    userId: 'EMP002',
    date: '2024-04-11',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR029',
    userId: 'EMP002',
    date: '2024-04-10',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR030',
    userId: 'EMP002',
    date: '2024-04-09',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR031',
    userId: 'EMP002',
    date: '2024-04-08',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR032',
    userId: 'EMP002',
    date: '2024-04-05',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR033',
    userId: 'EMP002',
    date: '2024-04-04',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR034',
    userId: 'EMP002',
    date: '2024-04-03',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR035',
    userId: 'EMP002',
    date: '2024-04-02',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR036',
    userId: 'EMP002',
    date: '2024-04-01',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR037',
    userId: 'EMP002',
    date: '2024-03-29',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR038',
    userId: 'EMP002',
    date: '2024-03-28',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR039',
    userId: 'EMP002',
    date: '2024-03-27',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente D',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR040',
    userId: 'EMP002',
    date: '2024-03-26',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientTag: 'Cliente C',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  
  // Registros para Miguel Sánchez (EMP003) - Último mes (menos días porque está inactivo)
  {
    id: 'TR041',
    userId: 'EMP003',
    date: '2024-04-10',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente E',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR042',
    userId: 'EMP003',
    date: '2024-04-09',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente F',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR043',
    userId: 'EMP003',
    date: '2024-04-08',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente E',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR044',
    userId: 'EMP003',
    date: '2024-04-05',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente F',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR045',
    userId: 'EMP003',
    date: '2024-04-04',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente E',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR046',
    userId: 'EMP003',
    date: '2024-04-03',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente F',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR047',
    userId: 'EMP003',
    date: '2024-04-02',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente E',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR048',
    userId: 'EMP003',
    date: '2024-04-01',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente F',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR049',
    userId: 'EMP003',
    date: '2024-03-29',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente E',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  {
    id: 'TR050',
    userId: 'EMP003',
    date: '2024-03-28',
    startTime: '09:00',
    endTime: '18:00',
    totalWorkTime: 540,
    clientTag: 'Cliente F',
    usedEntryTolerance: true,
    usedExitTolerance: false
  },
  
  // Registros para Laura Gómez (EMP004) - Último mes
  {
    id: 'TR051',
    userId: 'EMP004',
    date: '2024-04-20',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR052',
    userId: 'EMP004',
    date: '2024-04-19',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR053',
    userId: 'EMP004',
    date: '2024-04-18',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR054',
    userId: 'EMP004',
    date: '2024-04-17',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR055',
    userId: 'EMP004',
    date: '2024-04-16',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR056',
    userId: 'EMP004',
    date: '2024-04-15',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR057',
    userId: 'EMP004',
    date: '2024-04-12',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR058',
    userId: 'EMP004',
    date: '2024-04-11',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR059',
    userId: 'EMP004',
    date: '2024-04-10',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR060',
    userId: 'EMP004',
    date: '2024-04-09',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR061',
    userId: 'EMP004',
    date: '2024-04-08',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR062',
    userId: 'EMP004',
    date: '2024-04-05',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR063',
    userId: 'EMP004',
    date: '2024-04-04',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR064',
    userId: 'EMP004',
    date: '2024-04-03',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR065',
    userId: 'EMP004',
    date: '2024-04-02',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR066',
    userId: 'EMP004',
    date: '2024-04-01',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR067',
    userId: 'EMP004',
    date: '2024-03-29',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR068',
    userId: 'EMP004',
    date: '2024-03-28',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR069',
    userId: 'EMP004',
    date: '2024-03-27',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente H',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR070',
    userId: 'EMP004',
    date: '2024-03-26',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientTag: 'Cliente G',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  
  // Registros para Javier López (EMP005) - Último mes
  {
    id: 'TR071',
    userId: 'EMP005',
    date: '2024-04-20',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR072',
    userId: 'EMP005',
    date: '2024-04-19',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR073',
    userId: 'EMP005',
    date: '2024-04-18',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR074',
    userId: 'EMP005',
    date: '2024-04-17',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR075',
    userId: 'EMP005',
    date: '2024-04-16',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR076',
    userId: 'EMP005',
    date: '2024-04-15',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR077',
    userId: 'EMP005',
    date: '2024-04-12',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR078',
    userId: 'EMP005',
    date: '2024-04-11',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR079',
    userId: 'EMP005',
    date: '2024-04-10',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR080',
    userId: 'EMP005',
    date: '2024-04-09',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR081',
    userId: 'EMP005',
    date: '2024-04-08',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR082',
    userId: 'EMP005',
    date: '2024-04-05',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR083',
    userId: 'EMP005',
    date: '2024-04-04',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR084',
    userId: 'EMP005',
    date: '2024-04-03',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR085',
    userId: 'EMP005',
    date: '2024-04-02',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR086',
    userId: 'EMP005',
    date: '2024-04-01',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR087',
    userId: 'EMP005',
    date: '2024-03-29',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR088',
    userId: 'EMP005',
    date: '2024-03-28',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR089',
    userId: 'EMP005',
    date: '2024-03-27',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente I',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  {
    id: 'TR090',
    userId: 'EMP005',
    date: '2024-03-26',
    startTime: '09:30',
    endTime: '18:30',
    totalWorkTime: 540,
    clientTag: 'Cliente J',
    usedEntryTolerance: false,
    usedExitTolerance: false
  }
];

// Función para obtener clientes únicos
export function getUniqueClients() {
  const clients = sampleTimeRecords.map(record => record.clientTag).filter(Boolean);
  return [...new Set(clients)];
}

// Función para guardar un nuevo empleado
export function saveEmployee(employeeData) {
  // Obtener empleados existentes del localStorage o usar el array de muestra
  let employees = [];
  try {
    const storedEmployees = localStorage.getItem('employees');
    employees = storedEmployees ? JSON.parse(storedEmployees) : [...sampleEmployees];
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    employees = [...sampleEmployees];
  }
  
  // Generar ID único para el nuevo empleado
  const lastId = employees.length > 0 
    ? parseInt(employees[employees.length - 1].id.replace('EMP', '')) 
    : 0;
  const newId = `EMP${String(lastId + 1).padStart(3, '0')}`;
  
  // Crear nuevo empleado
  const newEmployee = {
    id: newId,
    name: employeeData.name,
    email: employeeData.email,
    department: employeeData.department,
    position: employeeData.position,
    startDate: employeeData.startDate,
    status: 'active'
  };
  
  // Añadir el nuevo empleado al array
  employees.push(newEmployee);
  
  // Guardar en localStorage
  try {
    localStorage.setItem('employees', JSON.stringify(employees));
    return { success: true, employee: newEmployee };
  } catch (error) {
    console.error('Error al guardar empleado:', error);
    return { success: false, error: 'Error al guardar empleado' };
  }
}

// Función para obtener todos los empleados
export function getEmployees() {
  try {
    const storedEmployees = localStorage.getItem('employees');
    return storedEmployees ? JSON.parse(storedEmployees) : sampleEmployees;
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return sampleEmployees;
  }
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

/**
 * @typedef {Object} Employee
 * @property {string} id - Identificador único del empleado
 * @property {string} name - Nombre completo del empleado
 * @property {string} email - Correo electrónico del empleado
 * @property {string} department - Departamento al que pertenece
 * @property {string} position - Cargo o posición
 * @property {string} startDate - Fecha de inicio (formato YYYY-MM-DD)
 * @property {string} status - Estado (active/inactive)
 */
