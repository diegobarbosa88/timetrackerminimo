export interface TimeTrackingModels {
  // Definição de tipos para TypeScript
}

export interface TimeRecord {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalWorkTime?: number;
  clientTag?: string; // Será substituído/atualizado para clientId
  clientId?: string; // Novo campo para referenciar o ID do cliente
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
  // Adicionar um campo para senha se não existir, ou confirmar como é gerenciada
  password?: string; // Exemplo, verificar estrutura de auth.tsx
  timeRecords?: TimeRecord[]; // Opcional, se for carregar junto
}

export interface Client {
  id: string; // Ex: CLI001
  name: string; // Obrigatório
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: 'active' | 'inactive'; // Ativo ou Inativo
}

