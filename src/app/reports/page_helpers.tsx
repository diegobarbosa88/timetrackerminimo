import { Employee, TimeRecord, Funcao, Client } from "../../lib/time-tracking-models";

// Cache em memória para os dados do localStorage
const dataCache: {
    employees?: Employee[];
    timeRecords?: TimeRecord[];
    funcoes?: Funcao[];
    clients?: Client[];
    uniqueClients?: string[];
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos
let lastCacheClearTime = 0;

const clearCacheIfNeeded = () => {
    if (Date.now() - lastCacheClearTime > CACHE_DURATION) {
        console.log("Limpando cache de dados do localStorage...");
        dataCache.employees = undefined;
        dataCache.timeRecords = undefined;
        dataCache.funcoes = undefined;
        dataCache.clients = undefined;
        dataCache.uniqueClients = undefined;
        lastCacheClearTime = Date.now();
    }
};

// Função para buscar dados de funcionários do localStorage com cache
export const getEmployeesData = (): Employee[] => {
    clearCacheIfNeeded();
    if (typeof window !== "undefined") {
        if (dataCache.employees) {
            return dataCache.employees;
        }
        const data = localStorage.getItem("timetracker_employees");
        const parsedData = data ? JSON.parse(data) : [];
        dataCache.employees = parsedData;
        return parsedData;
    }
    return [];
};

// Função para buscar todos os registros de ponto do localStorage com cache
export const getAllTimeRecordsData = (): TimeRecord[] => {
    clearCacheIfNeeded();
    if (typeof window !== "undefined") {
        if (dataCache.timeRecords) {
            return dataCache.timeRecords;
        }
        const data = localStorage.getItem("timetracker_time_records");
        const parsedData = data ? JSON.parse(data) : [];
        dataCache.timeRecords = parsedData;
        return parsedData;
    }
    return [];
};

// Função para buscar dados de funções do localStorage com cache
export const getFuncoesData = (): Funcao[] => {
    clearCacheIfNeeded();
    if (typeof window !== "undefined") {
        if (dataCache.funcoes) {
            return dataCache.funcoes;
        }
        const data = localStorage.getItem("timetracker_funcoes");
        const parsedData = data ? JSON.parse(data) : [];
        dataCache.funcoes = parsedData;
        return parsedData;
    }
    return [];
};

// Função para buscar dados de clientes do localStorage com cache
export const getClientsData = (): Client[] => {
    clearCacheIfNeeded();
    if (typeof window !== "undefined") {
        if (dataCache.clients) {
            return dataCache.clients;
        }
        const data = localStorage.getItem("timetracker_clients");
        const parsedData = data ? JSON.parse(data) : [];
        dataCache.clients = parsedData;
        return parsedData;
    }
    return [];
};

// Função para obter uma lista de clientes únicos a partir dos registros de ponto com cache
export const getUniqueClients = (): string[] => {
    clearCacheIfNeeded();
    if (typeof window !== "undefined") {
        if (dataCache.uniqueClients) {
            return dataCache.uniqueClients;
        }
        const records = getAllTimeRecordsData(); // Usa a função com cache
        const clientSet = new Set<string>();
        records.forEach(record => {
            if (record.client) {
                clientSet.add(record.client);
            }
        });
        const uniqueClientsArray = Array.from(clientSet).sort();
        dataCache.uniqueClients = uniqueClientsArray;
        return uniqueClientsArray;
    }
    return [];
};

// Função para invalidar o cache (chamar quando os dados do localStorage são alterados)
export const invalidateDataCache = () => {
    console.log("Invalidando cache de dados do localStorage...");
    dataCache.employees = undefined;
    dataCache.timeRecords = undefined;
    dataCache.funcoes = undefined;
    dataCache.clients = undefined;
    dataCache.uniqueClients = undefined;
    lastCacheClearTime = Date.now(); // Reseta o timer do cache
};

// Função para converter string de data (DD/MM/YYYY ou YYYY-MM-DD) para objeto Date
export const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    let dateObject: Date | null = null;
    if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            dateObject = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    } else if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            dateObject = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
    }
    return dateObject && !isNaN(dateObject.getTime()) ? dateObject : null;
};

// Função para formatar minutos em horas e minutos (ex: 125 minutos -> "2h 5m")
export const formatMinutesToHoursMinutes = (totalMinutes: number): string => {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
        return "0h 0m";
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

interface ReportStats {
    totalHoursWorked: string;
    totalDaysWorked: number;
}

export const calculateReportStats = (filteredRecords: TimeRecord[], allEmployees: Employee[], employeeIdFilter: string): ReportStats | null => {
    if (!filteredRecords || filteredRecords.length === 0) {
        return {
            totalHoursWorked: "0h 0m",
            totalDaysWorked: 0,
        };
    }
    let totalMinutesWorked = 0;
    const workedDaysSet = new Set<string>();
    filteredRecords.forEach(record => {
        totalMinutesWorked += record.totalWorkTime || 0;
        const dayIdentifier = employeeIdFilter === "all" ? `${record.userId}-${record.date}` : record.date;
        workedDaysSet.add(dayIdentifier);
    });
    return {
        totalHoursWorked: formatMinutesToHoursMinutes(totalMinutesWorked),
        totalDaysWorked: workedDaysSet.size,
    };
};

export type { Employee, TimeRecord, ReportStats };
