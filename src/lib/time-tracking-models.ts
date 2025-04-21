export interface TimeTrackingModels {
  // Definición de tipos para TypeScript
}

export interface TimeRecord {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalWorkTime?: number;
  clientTag?: string;
  usedEntryTolerance: boolean;
  usedExitTolerance: boolean;
}
