// Dados de exemplo para os empregados
export const sampleEmployees = [
  {
    id: 'EMP001',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@magneticplace.com',
    department: 'Operações',
    position: 'Técnico Senior',
    startDate: '2023-03-15',
    status: 'active',
    // Exemplo de clientes e função padrão atribuídos
    assignedClientIds: ['CLI001', 'CLI002'],
    defaultClientId: 'CLI001',
    assignedFuncaoIds: ['FUNC001', 'FUNC002', 'FUNC006'],
    defaultFuncaoId: 'FUNC001'
  },
  {
    id: 'EMP002',
    name: 'Ana Martínez',
    email: 'ana.martinez@magneticplace.com',
    department: 'Administração',
    position: 'Gerente Administrativa',
    startDate: '2023-02-01',
    status: 'active',
    assignedClientIds: ['CLI003', 'CLI004'],
    defaultClientId: 'CLI003',
    assignedFuncaoIds: ['FUNC005', 'FUNC002'],
    defaultFuncaoId: 'FUNC005'
  },
  {
    id: 'EMP003',
    name: 'Miguel Sánchez',
    email: 'miguel.sanchez@magneticplace.com',
    department: 'Vendas',
    position: 'Representante de Ventas',
    startDate: '2023-05-10',
    status: 'inactive'
  },
  {
    id: 'EMP004',
    name: 'Laura Gómez',
    email: 'laura.gomez@magneticplace.com',
    department: 'Operações',
    position: 'Analista de Operações',
    startDate: '2023-01-05',
    status: 'active',
    assignedClientIds: ['CLI001', 'CLI003', 'CLI005'],
    defaultClientId: 'CLI005',
    assignedFuncaoIds: ['FUNC001', 'FUNC003', 'FUNC004', 'FUNC006'],
    defaultFuncaoId: 'FUNC003'
  },
  {
    id: 'EMP005',
    name: 'Javier López',
    email: 'javier.lopez@magneticplace.com',
    department: 'Vendas',
    position: 'Director Comercial',
    startDate: '2023-02-15',
    status: 'active'
  }
];

// Dados de exemplo para as Funções
export const sampleFuncoes = [
  { id: 'FUNC001', name: 'Desenvolvimento de Software', description: 'Tarefas relacionadas à codificação e desenvolvimento de novas funcionalidades.', status: 'active' },
  { id: 'FUNC002', name: 'Reunião com Cliente', description: 'Participação em reuniões com clientes para discussão de projetos.', status: 'active' },
  { id: 'FUNC003', name: 'Suporte Técnico', description: 'Prestação de suporte técnico a usuários e clientes.', status: 'active' },
  { id: 'FUNC004', name: 'Design Gráfico', description: 'Criação de interfaces, logotipos e materiais visuais.', status: 'active' },
  { id: 'FUNC005', name: 'Administrativo', description: 'Tarefas administrativas e de gestão interna.', status: 'active' },
  { id: 'FUNC006', name: 'Outra', description: 'Função não listada, especificar no comentário.', status: 'active' },
  { id: 'FUNC007', name: 'Treinamento Interno', description: 'Participação ou condução de treinamentos internos.', status: 'inactive' },
  { id: 'FUNC008', name: 'Pesquisa e Desenvolvimento', description: 'Atividades de pesquisa para inovação.', status: 'active' },
];

// Dados de exemplo para os clientes
export const sampleClients = [
    { id: 'CLI001', name: 'Tech Solutions Ltda', contactPerson: 'Roberto Silva', contactEmail: 'roberto@techsolutions.com', contactPhone: '(11) 98765-4321', address: 'Rua Inovação, 123, São Paulo, SP', status: 'active' },
    { id: 'CLI002', name: 'Global Marketing Inc.', contactPerson: 'Fernanda Costa', contactEmail: 'fernanda@globalmarketing.com', contactPhone: '(21) 91234-5678', address: 'Av. Criativa, 456, Rio de Janeiro, RJ', status: 'active' },
    { id: 'CLI003', name: 'Alpha Construções', contactPerson: 'Mariana Lima', contactEmail: 'mariana@alphaconstrucoes.com', contactPhone: '(31) 95678-1234', address: 'Alameda dos Projetos, 789, Belo Horizonte, MG', status: 'active' },
    { id: 'CLI004', name: 'Beta Consultoria', contactPerson: 'Lucas Mendes', contactEmail: 'lucas@betaconsultoria.com', contactPhone: '(41) 93456-8765', address: 'Praça da Estratégia, 101, Curitiba, PR', status: 'inactive' },
    { id: 'CLI005', name: 'Omega Finanças', contactPerson: 'Sofia Oliveira', contactEmail: 'sofia@omegafinancas.com', contactPhone: '(51) 98888-7777', address: 'Rodovia dos Investimentos, 202, Porto Alegre, RS', status: 'active' },
    { id: 'CLI006', name: 'Delta Varejo', contactPerson: 'Gabriel Alves', contactEmail: 'gabriel@deltavarejo.com', contactPhone: '(61) 97777-8888', address: 'Setor Comercial, Bloco A, Loja 3, Brasília, DF', status: 'active' },
    { id: 'CLI007', name: 'Gama Educação', contactPerson: 'Beatriz Santos', contactEmail: 'beatriz@gamaeducacao.com', contactPhone: '(71) 96666-5555', address: 'Rua do Conhecimento, 303, Salvador, BA', status: 'inactive' },
    { id: 'CLI008', name: 'Zeta Logística', contactPerson: 'Thiago Pereira', contactEmail: 'thiago@zetalogistica.com', contactPhone: '(81) 95555-6666', address: 'Porto de Suape, Galpão 4, Recife, PE', status: 'active' },
    { id: 'CLI009', name: 'Kappa Indústria', contactPerson: 'Larissa Ferreira', contactEmail: 'larissa@kappaindustria.com', contactPhone: '(91) 94444-3333', address: 'Distrito Industrial, Lote 5, Manaus, AM', status: 'active' },
    { id: 'CLI010', name: 'Lambda Saúde', contactPerson: 'Rafael Souza', contactEmail: 'rafael@lambdasaude.com', contactPhone: '(19) 93333-4444', address: 'Clínica Bem Estar, Sala 6, Campinas, SP', status: 'active' }, 
];

// Dados de exemplo para os registros de tempo (ampliados com historial e funcaoId)
export const sampleTimeRecords = [
  // Registros para Carlos Rodríguez (EMP001) - Último mes
  {
    id: 'TR001',
    userId: 'EMP001',
    date: '2024-04-20',
    startTime: '08:30',
    endTime: '17:45',
    totalWorkTime: 555, 
    clientId: 'CLI001',
    funcaoId: 'FUNC001', // Desenvolvimento
    comment: 'Finalização do módulo X.',
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
    clientId: 'CLI002',
    funcaoId: 'FUNC002', // Reunião
    comment: 'Alinhamento com cliente Y.',
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
    clientId: 'CLI001',
    funcaoId: 'FUNC003', // Suporte
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
    clientId: 'CLI001',
    funcaoId: 'FUNC001',
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
    clientId: 'CLI002',
    funcaoId: 'FUNC006', // Outra
    comment: 'Pesquisa de novas tecnologias.',
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  // ... (mais registros podem ser adicionados ou adaptados similarmente)

  // Registros para Ana Martínez (EMP002) - Último mes
  {
    id: 'TR021',
    userId: 'EMP002',
    date: '2024-04-20',
    startTime: '08:30',
    endTime: '17:30',
    totalWorkTime: 540,
    clientId: 'CLI003',
    funcaoId: 'FUNC005', // Administrativo
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
    clientId: 'CLI003',
    funcaoId: 'FUNC005',
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
    clientId: 'CLI004',
    funcaoId: 'FUNC002', // Reunião
    usedEntryTolerance: false,
    usedExitTolerance: false
  },
  // ... (mais registros)

  // Registros para Laura Gómez (EMP004)
   {
    id: 'TR051',
    userId: 'EMP004',
    date: '2024-04-20',
    startTime: '08:00',
    endTime: '16:30',
    totalWorkTime: 510,
    clientId: 'CLI005',
    funcaoId: 'FUNC004', // Design
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
    clientId: 'CLI001',
    funcaoId: 'FUNC001', // Desenvolvimento
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
    clientId: 'CLI003',
    funcaoId: 'FUNC006', // Outra
    comment: 'Organização de arquivos de projeto.',
    usedEntryTolerance: false,
    usedExitTolerance: false
  }
  // ... (mais registros)
];

// Função para inicializar o localStorage com dados de exemplo, se não existirem
export function initializeSampleData() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('timetracker_employees')) {
      // Adicionar timeRecords aos employees
      const employeesWithRecords = sampleEmployees.map(emp => {
        return {
          ...emp,
          timeRecords: sampleTimeRecords.filter(record => record.userId === emp.id)
        };
      });
      localStorage.setItem('timetracker_employees', JSON.stringify(employeesWithRecords));
    }
    if (!localStorage.getItem('timetracker_clients')) {
      localStorage.setItem('timetracker_clients', JSON.stringify(sampleClients));
    }
    if (!localStorage.getItem('timetracker_funcoes')) {
      localStorage.setItem('timetracker_funcoes', JSON.stringify(sampleFuncoes));
    }
     // Adicionar um usuário admin se não existir
    const storedUsers = localStorage.getItem('timetracker_users');
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    const adminExists = users.some((user: any) => user.email === 'admin@magneticplace.com');
    if (!adminExists) {
        users.push({
            id: 'admin-user-01',
            name: 'Admin MagneticPlace',
            email: 'admin@magneticplace.com',
            password: 'admin123', // Em um app real, isso seria hasheado
            role: 'admin'
        });
        localStorage.setItem('timetracker_users', JSON.stringify(users));
    }
  }
}

/**
 * @typedef {object} TimeRecord
 * @property {string} id - Identificador único del registro de tiempo
 * @property {string} userId - Identificador del empleado
 * @property {string} date - Fecha del registro (DD/MM/YYYY)
 * @property {string} startTime - Hora de inicio (HH:MM)
 * @property {string} [endTime] - Hora de fin (HH:MM)
 * @property {number} [totalWorkTime] - Tiempo total trabajado en minutos
 * @property {string} [clientId] - Identificador del cliente
 * @property {string} [funcaoId] - Identificador da Função (anteriormente clientTag ou customTag)
 * @property {string} [status] - Estado del registro (ej: Completo, Manual, Em Andamento)
 * @property {string} [comment] - Comentario adicional (pode incluir detalhe da função 'Outra')
 * @property {boolean} usedEntryTolerance - Indica si se usó la tolerancia de entrada
 * @property {boolean} usedExitTolerance - Indica si se usó la tolerancia de salida
 */

