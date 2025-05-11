export interface TimeTrackingModels {
  // Definição de tipos para TypeScript
}

export interface TimeRecord {
  id: string;
  userId: string;
  date: string; // Formato DD/MM/YYYY
  startTime: string; // Formato HH:MM
  endTime?: string; // Formato HH:MM
  totalWorkTime?: number; // Em minutos
  clientId?: string; 
  funcaoId?: string; // ID da Função selecionada para este registro de tempo (anteriormente clientTag)
  status?: 'Completo (Cron.)' | 'Manual' | 'Em Andamento' | string; 
  comment?: string; // Pode ser usado para descrições adicionais, incluindo detalhes de função "Outra"
  usedEntryTolerance: boolean;
  usedExitTolerance: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  startDate: string;
  status: 'active' | 'inactive';
  password?: string; 
  timeRecords?: TimeRecord[];
  assignedClientIds?: string[]; 
  defaultClientId?: string; 
  assignedFuncaoIds?: string[]; // IDs das Funções associadas ao trabalhador
  defaultFuncaoId?: string;   // ID da Função padrão para o trabalhador
}

export interface Client {
  id: string; 
  name: string; 
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: 'active' | 'inactive';
}

// Nova interface para Funcao
export interface Funcao {
  id: string; // Ex: FUNC001
  name: string; // Obrigatório, ex: Desenvolvimento, Reunião, Suporte, Design, Administrativo, Outra
  description?: string; // Opcional, para detalhar a função se necessário
  status: 'active' | 'inactive'; // Ativa ou Inativa
}

