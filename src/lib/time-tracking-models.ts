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
  clientTag?: string; // Etiqueta/tarefa específica (ex: Desenvolvimento, Design, Outro)
  customTag?: string; // Usado se clientTag for 'Outro', para a etiqueta específica do usuário
  status?: 'Completo (Cron.)' | 'Manual' | 'Em Andamento' | string; 
  comment?: string;
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

