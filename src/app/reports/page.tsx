
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../hooks/useAuth';
import {
    getEmployeesData,
    getAllTimeRecordsData,
    getUniqueClients,
    parseDateString,
    formatMinutesToHoursMinutes,
    TimeRecord,
    Employee,
    EmployeeReportData,
    DailyReportRecord
} from './page_helpers';

// Import Chart.js components and register necessary elements
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Define a type for Summary data
interface SummaryReportRecord {
  id: string;
  name: string;
  department?: string;
  workedDays: number;
  totalHoursFormatted: string;
  avgHoursFormatted: string;
  totalMinutes: number;
}

// --- Componente Principal (Com Gráficos) ---
export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('current_month');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [employees, setEmployees] = useState<Omit<Employee, 'timeRecords'>[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('');

  const reportRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const loadedEmployees = getEmployeesData();
        const uniqueClients = getUniqueClients();
        setEmployees(loadedEmployees);
        setClients(uniqueClients);

        if (!isAdmin && user?.id) {
          setEmployeeFilter(user.id);
        } else {
          setEmployeeFilter('all');
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    }
  }, [user, isAdmin]);

  const debugLocalStorage = () => {
    try {
      const data = localStorage.getItem("timetracker_employees");
      console.log("--- DEBUG LOCALSTORAGE ---");
      console.log("Raw data:", data);
      if (data) {
        console.log("Parsed data:", JSON.parse(data));
      }
      console.log("--- FIM DEBUG LOCALSTORAGE ---");
      alert("Conteúdo do localStorage 'timetracker_employees' logado no console.");
    } catch (error) {
      console.error("Erro ao ler localStorage:", error);
      alert("Erro ao tentar ler o localStorage.");
    }
  };

  const generateReportData = (type: string, range: string, employeeIdFilter: string, selectedClientFilter: string, isCustomRange: boolean, customStartDateStr: string, customEndDateStr: string) => {
    console.log("--- Iniciando generateReportData ---");
    console.log("Filtros:", { type, range, employeeIdFilter, selectedClientFilter, isCustomRange, customStartDateStr, customEndDateStr });

    const allTimeRecords = getAllTimeRecordsData();
    if (!allTimeRecords || allTimeRecords.length === 0) {
        return { type, data: [], chartData: null, startDate: '', endDate: '', employee: employeeIdFilter, client: selectedClientFilter };
    }

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
        case 'current_month':
        default:
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
      }
      if (filterStartDate > now) filterStartDate = new Date(now);
    }

    const filteredRecords = allTimeRecords.filter(record => {
      const recordDate = parseDateString(record.date);
      if (!recordDate) return false;
      const matchesDate = recordDate >= filterStartDate && recordDate <= filterEndDate;
      let matchesEmployee = isAdmin ? (employeeIdFilter === "all" || record.userId === employeeIdFilter) : (record.userId === user?.id);
      const matchesClient = selectedClientFilter === "all" || record.client === selectedClientFilter;
      return matchesDate && matchesEmployee && matchesClient;
    });
    console.log("Registros Filtrados:", filteredRecords);

    const allEmployeesList = getEmployeesData();
    let finalData: DailyReportRecord[] | SummaryReportRecord[] = [];
    let chartData = null;

    if (type === 'daily') {
        const employeeReportMap: Record<string, { name: string; records: DailyReportRecord[] }> = {};
        filteredRecords.forEach(record => {
            const userId = record.userId;
            if (!userId) return;
            if (!employeeReportMap[userId]) {
                const employee = allEmployeesList.find(emp => emp.id === userId);
                employeeReportMap[userId] = { name: employee ? employee.name : `ID: ${userId}`, records: [] };
            }
            employeeReportMap[userId].records.push({
                date: record.date,
                entryTime: record.entryTime || record.entry,
                exitTime: record.exitTime || record.exit,
                totalWorkTime: record.totalWorkTime || 0,
                client: record.client,
                tag: record.tag,
                comment: record.comment
            });
        });
        finalData = Object.values(employeeReportMap).flatMap(data => {
            data.records.sort((a, b) => {
                const dateA = parseDateString(a.date);
                const dateB = parseDateString(b.date);
                return dateB && dateA ? dateB.getTime() - dateA.getTime() : 0;
            });
            return data.records.map(record => ({ ...record, employeeName: data.name }));
        });
    } else if (type === 'summary') {
        const summaryMap: Record<string, { name: string; department?: string; totalMinutes: number; workedDaysSet: Set<string> }> = {};
        filteredRecords.forEach(record => {
            const userId = record.userId;
            if (!userId) return;
            if (!summaryMap[userId]) {
                const employee = allEmployeesList.find(emp => emp.id === userId);
                summaryMap[userId] = {
                    name: employee ? employee.name : `ID: ${userId}`,
                    department: employee?.department,
                    totalMinutes: 0,
                    workedDaysSet: new Set()
                };
            }
            summaryMap[userId].totalMinutes += record.totalWorkTime || 0;
            summaryMap[userId].workedDaysSet.add(record.date);
        });
        finalData = Object.entries(summaryMap).map(([userId, data]) => {
            const workedDays = data.workedDaysSet.size;
            const totalMinutes = data.totalMinutes;
            return {
                id: userId,
                name: data.name,
                department: data.department,
                workedDays: workedDays,
                totalHoursFormatted: formatMinutesToHoursMinutes(totalMinutes),
                avgHoursFormatted: workedDays > 0 ? formatMinutesToHoursMinutes(Math.round(totalMinutes / workedDays)) : '0h 0m',
                totalMinutes: totalMinutes
            };
        });

        // Prepare data for Chart.js
        const labels = finalData.map(item => item.name);
        const dataPoints = finalData.map(item => item.totalMinutes / 60); // Convert minutes to hours for the chart

        chartData = {
            labels,
            datasets: [
                {
                    label: 'Total Horas Trabalhadas',
                    data: dataPoints,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue color
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
        console.log("Chart Data:", chartData);
    }

    console.log("Dados Finais:", finalData);

    return {
      type,
      range: isCustomRange ? "custom" : range,
      employee: employeeIdFilter,
      client: selectedClientFilter,
      startDate: filterStartDate.toISOString().split("T")[0],
      endDate: filterEndDate.toISOString().split("T")[0],
      generatedAt: new Date().toISOString(),
      data: finalData,
      chartData: chartData // Include chart data in the result
    };
  };

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
        alert("Ocorreu um erro ao gerar o relatório.");
      }
      setIsGenerating(false);
    }, 500);
  };

  const downloadReport = async (format: string) => {
    if (!reportGenerated || !reportData || !reportData.data || reportData.data.length === 0) {
        alert("Nenhum dado para baixar.");
        return;
    }

    setIsDownloading(true);
    setDownloadFormat(format);

    const reportTitle = `Relatorio_${reportData.type}_${reportData.employee}_${reportData.client}_${reportData.startDate}_a_${reportData.endDate}`.replace(/[^a-zA-Z0-9_]/g, '-');

    try {
        if (format === 'pdf') {
            const pdf = new jsPDF('p', 'pt', 'a4');
            pdf.text(`Relatório ${reportData.type === 'daily' ? 'Diário Detalhado' : 'Resumo'}`, 40, 40);
            pdf.setFontSize(10);
            pdf.text(`Período: ${reportData.startDate} a ${reportData.endDate}`, 40, 55);
            // Add more header info if needed

            if (reportData.type === 'daily') {
                (pdf as any).autoTable({
                    head: [["Funcionário", "Data", "Entrada", "Saída", "Total", "Cliente", "Etiqueta", "Comentário"]],
                    body: reportData.data.map((rec: any) => [
                        rec.employeeName,
                        rec.date,
                        rec.entryTime,
                        rec.exitTime,
                        formatMinutesToHoursMinutes(rec.totalWorkTime),
                        rec.client,
                        rec.tag,
                        rec.comment || ''
                    ]),
                    startY: 70,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [22, 160, 133] }, // Example color
                });
            } else { // Summary
                 (pdf as any).autoTable({
                    head: [["Funcionário", "Departamento", "Dias Trab.", "Total Horas", "Média Diária"]],
                    body: reportData.data.map((rec: SummaryReportRecord) => [
                        rec.name,
                        rec.department || '-',
                        rec.workedDays,
                        rec.totalHoursFormatted,
                        rec.avgHoursFormatted
                    ]),
                    startY: 70,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [22, 160, 133] },
                });
            }
            pdf.save(`${reportTitle}.pdf`);

        } else if (format === 'excel') {
            let ws_data: any[][] = [];
            if (reportData.type === 'daily') {
                ws_data.push(["Funcionário", "Data", "Entrada", "Saída", "Total (fmt)", "Cliente", "Etiqueta", "Comentário"]);
                reportData.data.forEach((rec: any) => {
                    ws_data.push([
                        rec.employeeName,
                        rec.date,
                        rec.entryTime,
                        rec.exitTime,
                        formatMinutesToHoursMinutes(rec.totalWorkTime),
                        rec.client,
                        rec.tag,
                        rec.comment || ''
                    ]);
                });
            } else { // Summary
                ws_data.push(["Funcionário", "Departamento", "Dias Trab.", "Total Horas", "Média Diária", "Total Minutos"]);
                reportData.data.forEach((rec: SummaryReportRecord) => {
                    ws_data.push([
                        rec.name,
                        rec.department || '-',
                        rec.workedDays,
                        rec.totalHoursFormatted,
                        rec.avgHoursFormatted,
                        rec.totalMinutes
                    ]);
                });
            }
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
            XLSX.writeFile(wb, `${reportTitle}.xlsx`);
        }

    } catch (error) {
      console.error(`Erro ao baixar relatório como ${format}:`, error);
      alert(`Ocorreu um erro ao baixar o relatório como ${format}.`);
    } finally {
      setIsDownloading(false);
      setDownloadFormat('');
    }
  };

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

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Horas Trabalhadas por Funcionário',
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Horas'
            }
        }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Informes</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded bg-gray-50">
        {/* Tipo de Relatório */}
        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Informe</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="daily">Diário Detalhado</option>
            <option value="summary">Resumo por Funcionário</option>
          </select>
        </div>

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
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* Datas Personalizadas */}
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

        {/* Filtro Funcionário */}
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
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>)}
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
            {clients.map(client => <option key={client} value={client}>{client}</option>)}
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
          <p className="text-sm text-gray-600 mb-1">Tipo: {reportData.type === 'daily' ? 'Diário Detalhado' : 'Resumo por Funcionário'}</p>
          <p className="text-sm text-gray-600 mb-1">Período: {reportData.startDate} a {reportData.endDate}</p>
          {isAdmin && <p className="text-sm text-gray-600 mb-1">Funcionário: {reportData.employee === 'all' ? 'Todos' : employees.find(e => e.id === reportData.employee)?.name || reportData.employee}</p>}
          <p className="text-sm text-gray-600 mb-4">Cliente: {reportData.client === 'all' ? 'Todos' : reportData.client}</p>

          {/* Tabela de Relatório */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {reportData.type === 'daily' ? (
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
                ) : ( // Summary
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias Trab.</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Horas</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Média Diária</th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data && reportData.data.length > 0 ? (
                  reportData.data.map((rec: any, index: number) => (
                    reportData.type === 'daily' ? (
                      <tr key={`${rec.employeeName}-${rec.date}-${index}`}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rec.employeeName}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.entryTime}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.exitTime}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatMinutesToHoursMinutes(rec.totalWorkTime)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.client}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.tag}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{rec.comment || ''}</td>
                      </tr>
                    ) : ( // Summary
                      <tr key={rec.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rec.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.department || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.workedDays}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.totalHoursFormatted}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.avgHoursFormatted}</td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={reportData.type === 'daily' ? 8 : 5} className="px-4 py-4 text-center text-sm text-gray-500">
                      Nenhum registro encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Botões de Download */}
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => downloadReport('pdf')}
              disabled={isDownloading}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${isDownloading ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              {isDownloading && downloadFormat === 'pdf' ? 'Baixando PDF...' : 'Baixar PDF'}
            </button>
            <button
              onClick={() => downloadReport('excel')}
              disabled={isDownloading}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${isDownloading ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              {isDownloading && downloadFormat === 'excel' ? 'Baixando Excel...' : 'Baixar Excel'}
            </button>
          </div>

          {/* Área para Gráficos */}
          {reportData.type === 'summary' && reportData.chartData && (
            <div className="mt-8 p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 text-center">Horas Trabalhadas por Funcionário</h3>
              <div style={{ maxWidth: '600px', margin: 'auto' }}> {/* Limit chart width */}
                <Bar options={chartOptions} data={reportData.chartData} />
              </div>
            </div>
          )}
        </div>
      )}

      {!reportGenerated && !isGenerating && (
        <p className="text-center text-gray-500 mt-6">Selecione os filtros e clique em "Gerar Informe".</p>
      )}
    </div>
  );
}

