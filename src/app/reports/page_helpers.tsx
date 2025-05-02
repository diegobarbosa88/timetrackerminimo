
// --- Funções Auxiliares ---

// Função para parsear "Xh Ym" para minutos
const parseTotalTimeToMinutes = (totalString: string): number => {
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

// Função para obter dados de funcionários do localStorage
const getEmployeesData = (): Employee[] => {
  try {
    // Check if running in browser context before accessing localStorage
    if (typeof window !== 'undefined') {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        const parsedEmployees: Employee[] = JSON.parse(storedEmployees);
        // Retorna apenas os dados dos funcionários, sem os timeRecords aninhados aqui
        return parsedEmployees.map(({ timeRecords, ...employeeData }) => employeeData);
      }
    }
  } catch (error) {
    console.error('Erro ao obter funcionários do localStorage:', error);
  }
  // Retorna array vazio ou dados de exemplo se necessário
  return [];
};

// Função para obter TODOS os registros de tempo de TODOS os funcionários
const getAllTimeRecordsData = (): TimeRecord[] => {
  let allRecords: TimeRecord[] = [];
  try {
    // Check if running in browser context before accessing localStorage
    if (typeof window !== 'undefined') {
      const storedEmployees = localStorage.getItem("timetracker_employees");
      // console.log("DEBUG: Dados brutos do localStorage:", storedEmployees);
      if (storedEmployees) {
        const employees: Employee[] = JSON.parse(storedEmployees);
        // console.log("DEBUG: Funcionários parseados:", employees);
        employees.forEach(employee => {
          if (employee.timeRecords && Array.isArray(employee.timeRecords)) {
            const employeeRecords = employee.timeRecords.map(record => ({
              ...record,
              userId: employee.id, // Garante que cada registro saiba a quem pertence
              totalWorkTime: parseTotalTimeToMinutes(record.total),
              entryTime: record.entry, // Alias
              exitTime: record.exit, // Alias
              clientTag: `${record.client} - ${record.tag}` // Alias
            }));
            // console.log(`DEBUG: Registros para funcionário ${employee.id}:`, employeeRecords);
            allRecords = allRecords.concat(employeeRecords);
          } else {
            // console.log(`DEBUG: Funcionário ${employee.id} não tem timeRecords ou não é array.`);
          }
        });
      }
    }
  } catch (error) {
    console.error("Erro ao obter todos os registros de tempo do localStorage:", error);
  }
  // console.log("DEBUG: Todos os registros processados (getAllTimeRecordsData):", allRecords);
  return allRecords;
};

// Função para obter lista única de clientes
const getUniqueClients = (): string[] => {
  const allRecords = getAllTimeRecordsData();
  const clients = new Set<string>();
  allRecords.forEach(record => {
    if (record.client) {
      clients.add(record.client);
    }
  });
  return Array.from(clients).sort(); // Retorna lista ordenada
};


// Função auxiliar para calcular dias laborables en un rango
const getWorkingDaysInRange = (startDate: Date, endDate: Date): number => {
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
const formatMinutesToHoursMinutes = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes < 0) return '0h 0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

// Função para formatar data (DD/MM/YYYY para objeto Date)
const parseDateString = (dateString: string): Date | null => {
  try {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Formato DD/MM/YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      // Verifica se a data é válida (evita datas como 31/02)
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  } catch (e) {
    console.error("Erro ao parsear string de data:", dateString, e);
  }
  return null;
};

