
// src/app/reports/page_helpers.tsx

// --- Tipos ---
// Adicionando export e definindo tipos que estavam faltando
export interface TimeRecord {
  id: string;
  date: string; // Formato DD/MM/YYYY
  entry: string; // Formato HH:MM
  exit: string; // Formato HH:MM
  total: string; // Formato Xh Ym
  status: string;
  client: string;
  tag: string;
  comment?: string;
  customTag?: string;
  // Campos adicionados para compatibilidade com relatórios
  userId?: string; // ID do usuário ao qual o registro pertence
  totalWorkTime?: number; // Duração em minutos
  entryTime?: string; // Alias para entry
  exitTime?: string; // Alias para exit
  clientTag?: string; // Alias para client + tag
}

export interface Employee {
  id: string;
  name: string;
  department?: string;
  email?: string;
  position?: string;
  startDate?: string;
  status?: string;
  timeRecords?: TimeRecord[]; // Mantido aqui para parse inicial, mas não usado diretamente no getEmployeesData
}

export interface DailyReportRecord {
  date: string;
  entryTime: string;
  exitTime: string;
  totalWorkTime: number; // minutes
  client: string;
  tag: string;
  comment?: string;
  // Adicionado para a tabela flat
  employeeName?: string;
}

export interface EmployeeReportData {
  id: string;
  name: string;
  department?: string;
  dailyRecords: DailyReportRecord[];
  totalMinutes: number;
  totalDays: number;
  totalHours?: number;
  totalRemainingMinutes?: number;
  avgDailyHours?: number;
  avgDailyRemainingMinutes?: number;
}


// --- Funções Auxiliares ---

// Função para parsear "Xh Ym" para minutos
export const parseTotalTimeToMinutes = (totalString: string): number => {
  if (!totalString) return 0;
  let totalMinutes = 0;
  try {
    const hourMatch = totalString.match(/(\d+)h/);
    const minMatch = totalString.match(/(\d+)m/);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1], 10) * 60;
    }
    if (minMatch) {
      totalMinutes += parseInt(minMatch[1], 10);
    }
  } catch (e) {
    console.error("Erro ao parsear total time:", totalString, e);
  }
  return totalMinutes;
};

// Função para obter dados de funcionários do localStorage (apenas dados do funcionário)
export const getEmployeesData = (): Omit<Employee, 'timeRecords'>[] => {
  try {
    if (typeof window !== 'undefined') {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        const parsedEmployees: Employee[] = JSON.parse(storedEmployees);
        return parsedEmployees.map(({ timeRecords, ...employeeData }) => employeeData);
      }
    }
  } catch (error) {
    console.error('Erro ao obter funcionários do localStorage:', error);
  }
  return [];
};

// Função para obter TODOS os registros de tempo de TODOS os funcionários
export const getAllTimeRecordsData = (): TimeRecord[] => {
  let allRecords: TimeRecord[] = [];
  try {
    if (typeof window !== 'undefined') {
      const storedEmployees = localStorage.getItem("timetracker_employees");
      if (storedEmployees) {
        const employees: Employee[] = JSON.parse(storedEmployees);
        employees.forEach(employee => {
          if (employee.timeRecords && Array.isArray(employee.timeRecords)) {
            const employeeRecords = employee.timeRecords.map(record => ({
              ...record,
              userId: employee.id,
              totalWorkTime: parseTotalTimeToMinutes(record.total),
              entryTime: record.entry,
              exitTime: record.exit,
              clientTag: `${record.client} - ${record.tag}`
            }));
            allRecords = allRecords.concat(employeeRecords);
          }
        });
      }
    }
  } catch (error) {
    console.error("Erro ao obter todos os registros de tempo do localStorage:", error);
  }
  return allRecords;
};

// Função para obter lista única de clientes
export const getUniqueClients = (): string[] => {
  const allRecords = getAllTimeRecordsData();
  const clients = new Set<string>();
  allRecords.forEach(record => {
    if (record.client) {
      clients.add(record.client);
    }
  });
  return Array.from(clients).sort();
};


// Função auxiliar para calcular dias laborables en un rango (não usada na versão simplificada, mas mantida)
export const getWorkingDaysInRange = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const currentDate = new Date(startDate.getTime());
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclui Domingo (0) e Sábado (6)
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};

// Função para formatar minutos como horas e minutos
export const formatMinutesToHoursMinutes = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes < 0) return '0h 0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

// Função para formatar data (DD/MM/YYYY para objeto Date)
export const parseDateString = (dateString: string): Date | null => {
  try {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  } catch (e) {
    console.error("Erro ao parsear string de data:", dateString, e);
  }
  return null;
};

