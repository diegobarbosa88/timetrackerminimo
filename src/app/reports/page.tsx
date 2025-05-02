
'use client';

import React, { useState, useEffect, useRef } from 'react';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable'; // Import jspdf-autotable
// import * as XLSX from 'xlsx';
// import html2canvas from 'html2canvas';
import { useAuth } from '../hooks/useAuth'; // Ensure this import is correct and present
import {
    getEmployeesData,
    getAllTimeRecordsData,
    getUniqueClients,
    parseDateString,
    formatMinutesToHoursMinutes,
    TimeRecord, // Import types if needed or define them here
    Employee,   // Import types if needed or define them here
    EmployeeReportData, // Import types if needed or define them here
    DailyReportRecord // Import type
} from './page_helpers'; // Import helpers

// --- Componente Principal (Simplificado) ---
export default function ReportsPage() {
  const { user } = useAuth(); // Hook useAuth importado
  const isAdmin = user?.role === "admin";

  // Estados Essenciais
  const [reportType, setReportType] = useState('daily'); // Manter apenas 'daily' por enquanto?
  const [dateRange, setDateRange] = useState('current_month');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportRef = useRef(null); // Manter para possível uso futuro (imagem?)

  // Carregar funcionários, clientes e definir datas padrão
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const loadedEmployees = getEmployeesData();
        const uniqueClients = getUniqueClients();
        setEmployees(loadedEmployees);
        setClients(uniqueClients);

        if (!isAdmin && user?.id) {
          console.log("Setting employee filter for non-admin user:", user.id);
          setEmployeeFilter(user.id);
        } else {
          console.log("Setting employee filter for admin or no user:", 'all');
          setEmployeeFilter('all');
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        // Considerar mostrar um erro para o usuário
      }
    }
  }, [user, isAdmin]);

  // Função para logar o conteúdo do localStorage
  const debugLocalStorage = () => {
    try {
      const data = localStorage.getItem("timetracker_employees");
      console.log("--- DEBUG LOCALSTORAGE ---");
      console.log("Raw data:", data);
      if (data) {
        console.log("Parsed data:", JSON.parse(data));
      }
      console.log("--- FIM DEBUG LOCALSTORAGE ---");
      alert("Conteúdo do localStorage 'timetracker_employees' logado no console do navegador.");
    } catch (error) {
      console.error("Erro ao ler localStorage:", error);
      alert("Erro ao tentar ler o localStorage. Verifique o console.");
    }
  };

  // Função principal para gerar dados do relatório (Simplificada)
  const generateReportData = (type: string, range: string, employeeIdFilter: string, selectedClientFilter: string, isCustomRange: boolean, customStartDateStr: string, customEndDateStr: string) => {
    console.log("--- Iniciando generateReportData (Simplificado) ---");
    console.log("User:", user);
    console.log("Is Admin:", isAdmin);
    console.log("Filtros Recebidos:", { type, range, employeeIdFilter, selectedClientFilter, isCustomRange, customStartDateStr, customEndDateStr });

    // 1. Obter todos os registros
    const allTimeRecords = getAllTimeRecordsData();
    console.log("Todos os Registros (getAllTimeRecordsData):", allTimeRecords);
    if (!allTimeRecords || allTimeRecords.length === 0) {
        console.log("Nenhum registro encontrado no localStorage.");
        return { type: 'daily', data: [], startDate: '', endDate: '', employee: employeeIdFilter, client: selectedClientFilter }; // Retorna estrutura vazia
    }

    // 2. Definir período de datas
    const now = new Date();
    let filterStartDate = new Date();
    let filterEndDate = new Date(now);

    if (isCustomRange && customStartDateStr && customEndDateStr) {
      filterStartDate = new Date(customStartDateStr + 'T00:00:00');
      filterEndDate = new Date(customEndDateStr + 'T23:59:59');
    } else {
      switch (range) {
        case 'week': filterStartDate.setDate(now.getDate() - 7); filterStartDate.setHours(0,0,0,0); break;
        case 'month': filterStartDate.setMonth(now.getMonth() - 1); filterStartDate.setHours(0,0,0,0); break;
        case 'quarter': filterStartDate.setMonth(now.getMonth() - 3); filterStartDate.setHours(0,0,0,0); break;
        case 'year': filterStartDate.setFullYear(now.getFullYear() - 1); filterStartDate.setHours(0,0,0,0); break;
        case 'current_month':
        default:
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
      }
      if (filterStartDate > now) filterStartDate = new Date(now);
    }
    console.log("Período de Datas:", { filterStartDate, filterEndDate });

    // 3. Filtrar registros
    const filteredRecords = allTimeRecords.filter(record => {
      const recordDate = parseDateString(record.date);
      if (!recordDate) {
          console.warn(`Registro ignorado por data inválida: ${record.id}, ${record.date}`);
          return false;
      }

      const matchesDate = recordDate >= filterStartDate && recordDate <= filterEndDate;

      let matchesEmployee = false;
      if (isAdmin) {
          matchesEmployee = employeeIdFilter === "all" || record.userId === employeeIdFilter;
      } else {
          matchesEmployee = record.userId === user?.id;
          if (!user?.id) console.warn("Usuário não admin sem ID, não será possível filtrar!");
      }

      const matchesClient = selectedClientFilter === "all" || record.client === selectedClientFilter;

      // Log detalhado da filtragem
      // console.log(`Record ${record.id} (User: ${record.userId}, Date: ${record.date}, Client: ${record.client}) -> Date=${matchesDate}, Emp=${matchesEmployee}, Client=${matchesClient}`);

      return matchesDate && matchesEmployee && matchesClient;
    });
    console.log("Registros Filtrados:", filteredRecords);

    // 4. Agrupar por funcionário (se necessário para a exibição)
    const allEmployeesList = getEmployeesData();
    const employeeReportMap: Record<string, { name: string; records: DailyReportRecord[] }> = {};

    filteredRecords.forEach(record => {
        const userId = record.userId;
        if (!userId) {
            console.warn("Registro filtrado sem userId:", record);
            return; // Ignora registros sem userId
        }

        if (!employeeReportMap[userId]) {
            const employee = allEmployeesList.find(emp => emp.id === userId);
            employeeReportMap[userId] = {
                name: employee ? employee.name : `ID: ${userId}`, // Usa nome ou ID
                records: []
            };
        }

        employeeReportMap[userId].records.push({
            // Mapeia os campos necessários para DailyReportRecord
            date: record.date,
            entryTime: record.entryTime || record.entry,
            exitTime: record.exitTime || record.exit,
            totalWorkTime: record.totalWorkTime || 0,
            client: record.client,
            tag: record.tag,
            comment: record.comment
        });
    });
    console.log("Dados Agrupados por Funcionário:", employeeReportMap);

    // 5. Formatar dados finais para a tabela (flat list)
    const finalReportData = Object.entries(employeeReportMap).flatMap(([userId, data]) => {
        // Ordena os registros de cada funcionário por data (mais recente primeiro)
        data.records.sort((a, b) => {
            const dateA = parseDateString(a.date);
            const dateB = parseDateString(b.date);
            if (!dateA || !dateB) return 0;
            return dateB.getTime() - dateA.getTime();
        });
        // Adiciona o nome do funcionário a cada registro para a tabela flat
        return data.records.map(record => ({ ...record, employeeName: data.name }));
    });

    console.log("Dados Finais para Tabela:", finalReportData);

    return {
      type: 'daily', // Apenas tipo diário por enquanto
      range: isCustomRange ? "custom" : range,
      employee: employeeIdFilter,
      client: selectedClientFilter,
      startDate: filterStartDate.toISOString().split("T")[0],
      endDate: filterEndDate.toISOString().split("T")[0],
      generatedAt: new Date().toISOString(),
      data: finalReportData // Lista plana de registros
    };
  };

  // Função para gerar o relatório (interface)
  const generateReport = () => {
    setIsGenerating(true);
    setReportGenerated(false);
    setReportData(null);

    setTimeout(() => {
      try {
        const data = generateReportData(reportType, dateRange, employeeFilter, clientFilter, customDateRange, startDate, endDate);
        setReportData(data);
        setReportGenerated(true);
      } catch (error) {
        console.error("Erro ao gerar dados do relatório:", error);
        alert("Ocorreu um erro ao gerar o relatório. Verifique o console para mais detalhes.");
      }
      setIsGenerating(false);
    }, 500); // Pequeno delay para UI
  };

  // Funções de download removidas/comentadas
  // const downloadReport = async (format: string) => { ... };

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateRange(value);
    setCustomDateRange(value === 'custom');
    if (value !== 'custom') {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Informes (Simplificado)</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded bg-gray-50">
        {/* Tipo de Relatório (mantido, mas lógica só suporta 'daily') */}
        {/*
        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Informe</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="daily">Diário Detalhado</option>
             <option value="summary">Resumo por Funcionário</option> // Removido temporariamente
          </select>
        </div>
        */}

        {/* Período */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={handleDateRangeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="current_month">Mês Atual</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Último Mês</option>
            {/* <option value="quarter">Último Trimestre</option> */}
            {/* <option value="year">Último Ano</option> */}
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* Datas Personalizadas (condicional) */}
        {customDateRange && (
          <>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
          </>
        )}

        {/* Filtro Funcionário (condicional para admin) */}
        {isAdmin && (
          <div>
            <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
            <select
              id="employeeFilter"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro Cliente */}
        <div>
          <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select
            id="clientFilter"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">Todos</option>
            {clients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>

        {/* Botão Gerar Relatório */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex items-end space-x-2">
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
          >
            {isGenerating ? 'Gerando...' : 'Gerar Informe'}
          </button>
          <button
            onClick={debugLocalStorage}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Debug LocalStorage
          </button>
        </div>
      </div>

      {/* Área do Relatório */}
      {reportGenerated && reportData && (
        <div ref={reportRef} className="mt-6 p-4 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Relatório Gerado</h2>
          <p className="text-sm text-gray-600 mb-1">Período: {reportData.startDate} a {reportData.endDate}</p>
          {isAdmin && <p className="text-sm text-gray-600 mb-1">Funcionário: {reportData.employee === 'all' ? 'Todos' : employees.find(e => e.id === reportData.employee)?.name || reportData.employee}</p>}
          <p className="text-sm text-gray-600 mb-4">Cliente: {reportData.client === 'all' ? 'Todos' : reportData.client}</p>

          {/* Tabela de Relatório Simplificada (Diário Detalhado) */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saída</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiqueta</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentário</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data && reportData.data.length > 0 ? (
                  reportData.data.map((rec: any, index: number) => (
                    <tr key={`${rec.employeeName}-${rec.date}-${index}`}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rec.employeeName}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.date}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.entryTime}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.exitTime}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatMinutesToHoursMinutes(rec.totalWorkTime)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.client}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.tag}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{rec.comment}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">
                      Nenhum registro encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Botões de Download Removidos */}
          {/*
          <div className="mt-6 flex justify-end space-x-2">
            <button ...>Baixar PDF</button>
            <button ...>Baixar Excel</button>
            <button ...>Baixar Imagem</button>
          </div>
          */}
        </div>
      )}

      {!reportGenerated && !isGenerating && (
        <p className="text-center text-gray-500 mt-6">Selecione os filtros e clique em "Gerar Informe" para visualizar os dados.</p>
      )}
    </div>
  );
}

