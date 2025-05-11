
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas'; // Adicionar importação html2canvas
import { useAuth } from '../hooks/useAuth';
import {
    getEmployeesData,
    getAllTimeRecordsData,
    getUniqueClients,
    parseDateString,
    formatMinutesToHoursMinutes,
    TimeRecord,
    Employee,
    // EmployeeReportData, // Removido se não usado diretamente aqui
    // DailyReportRecord // Removido se não usado diretamente aqui
} from './page_helpers';

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

interface DailyReportRecord {
    employeeName?: string; // Adicionado para consistência com o uso
    date: string;
    entryTime: string;
    exitTime: string;
    totalWorkTime: number;
    client: string;
    tag: string;
    comment?: string;
}

interface SummaryReportRecord {
  id: string;
  name: string;
  department?: string;
  workedDays: number;
  totalHoursFormatted: string;
  avgHoursFormatted: string;
  totalMinutes: number;
}

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

  const reportContentRef = useRef<HTMLDivElement>(null); // Ref para o conteúdo do relatório a ser capturado

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const loadedEmployees = getEmployeesData();
        const uniqueClientsList = getUniqueClients();
        setEmployees(loadedEmployees);
        setClients(uniqueClientsList);

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
        case 'week': filterStartDate.setDate(now.getDate() - now.getDay() - 6); filterStartDate.setHours(0,0,0,0); break; // Start of last week (Sunday)
        case 'month': 
            filterStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0,0,0,0);
            filterEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999); // Last day of previous month
            break;
        case 'current_month':
        default:
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // Last day of current month
          break;
      }
    }

    const filteredRecords = allTimeRecords.filter(record => {
      const recordDate = parseDateString(record.date);
      if (!recordDate) return false;
      const matchesDate = recordDate >= filterStartDate && recordDate <= filterEndDate;
      const matchesEmployee = isAdmin ? (employeeIdFilter === "all" || record.userId === employeeIdFilter) : (record.userId === user?.id);
      const matchesClient = selectedClientFilter === "all" || record.client === selectedClientFilter;
      return matchesDate && matchesEmployee && matchesClient;
    });

    const allEmployeesList = getEmployeesData();
    let finalData: DailyReportRecord[] | SummaryReportRecord[] = [];
    let chartData = null;

    if (type === 'daily') {
        const employeeReportMap: Record<string, { name: string; records: Omit<DailyReportRecord, 'employeeName'>[] }> = {};
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
        const labels = finalData.map((item: any) => item.name);
        const dataPoints = finalData.map((item: any) => item.totalMinutes / 60);
        chartData = {
            labels,
            datasets: [{
                label: 'Total Horas Trabalhadas',
                data: dataPoints,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }],
        };
    }
    return {
      type,
      range: isCustomRange ? "custom" : range,
      employee: employeeIdFilter,
      client: selectedClientFilter,
      startDate: filterStartDate.toISOString().split("T")[0],
      endDate: filterEndDate.toISOString().split("T")[0],
      generatedAt: new Date().toISOString(),
      data: finalData,
      chartData: chartData
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
    if (!reportContentRef.current) {
        alert("Erro: Referência do conteúdo do relatório não encontrada.");
        return;
    }

    setIsDownloading(true);
    setDownloadFormat(format);
    const reportTitle = `Relatorio_${reportData.type}_${reportData.employee}_${reportData.client}_${reportData.startDate}_a_${reportData.endDate}`.replace(/[^a-zA-Z0-9_]/g, '-');

    try {
        if (format === 'pdf') {
            const canvas = await html2canvas(reportContentRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10; // Margin top

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            // Adicionar título e informações do relatório ao PDF
            pdf.setFontSize(16);
            pdf.text(`Relatório ${reportData.type === 'daily' ? 'Diário Detalhado' : 'Resumo'}`, pdfWidth / 2, imgY + (imgHeight * ratio) + 15 , { align: 'center' });
            pdf.setFontSize(10);
            pdf.text(`Período: ${reportData.startDate} a ${reportData.endDate}`, pdfWidth / 2, imgY + (imgHeight * ratio) + 22, { align: 'center' });
            if (isAdmin) {
                 pdf.text(`Funcionário: ${reportData.employee === 'all' ? 'Todos' : employees.find(e => e.id === reportData.employee)?.name || reportData.employee}`, pdfWidth / 2, imgY + (imgHeight * ratio) + 29, { align: 'center' });
            }
            pdf.text(`Cliente: ${reportData.client === 'all' ? 'Todos' : reportData.client}`, pdfWidth / 2, imgY + (imgHeight * ratio) + (isAdmin ? 36 : 29), { align: 'center' });

            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${reportTitle}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);

        } else if (format === 'excel') {
            let ws_data: any[][] = [];
            if (reportData.type === 'daily') {
                ws_data.push(["Funcionário", "Data", "Entrada", "Saída", "Total (fmt)", "Cliente", "Etiqueta", "Comentário"]);
                reportData.data.forEach((rec: DailyReportRecord) => {
                    ws_data.push([
                        rec.employeeName || '-',
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
      alert(`Ocorreu um erro ao baixar o relatório como ${format}. Verifique o console para detalhes.`);
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Horas Trabalhadas por Funcionário' },
    },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Horas' } } }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Informes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded bg-gray-50">
        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Informe</label>
          <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="daily">Diário Detalhado</option>
            <option value="summary">Resumo por Funcionário</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <select id="dateRange" value={dateRange} onChange={handleDateRangeChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="current_month">Mês Atual</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        {customDateRange && (
          <>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" />
            </div>
          </>
        )}
        {isAdmin && (
          <div>
            <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
            <select id="employeeFilter" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="all">Todos</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select id="clientFilter" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="all">Todos</option>
            {clients.map(client => <option key={client} value={client}>{client}</option>)}
          </select>
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex items-end space-x-2">
          <button onClick={generateReport} disabled={isGenerating} className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}>
            {isGenerating ? 'Gerando...' : 'Gerar Informe'}
          </button>
          <button onClick={debugLocalStorage} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Debug LocalStorage
          </button>
        </div>
      </div>

      {reportGenerated && reportData && (
        <div className="mt-6 p-4 border rounded bg-white shadow">
          {/* Conteúdo do relatório para captura pelo html2canvas */}
          <div ref={reportContentRef} className="p-4 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-center">Relatório Gerado</h2>
            <p className="text-sm text-gray-600 mb-1 text-center">Tipo: {reportData.type === 'daily' ? 'Diário Detalhado' : 'Resumo por Funcionário'}</p>
            <p className="text-sm text-gray-600 mb-1 text-center">Período: {reportData.startDate} a {reportData.endDate}</p>
            {isAdmin && <p className="text-sm text-gray-600 mb-1 text-center">Funcionário: {reportData.employee === 'all' ? 'Todos' : employees.find(e => e.id === reportData.employee)?.name || reportData.employee}</p>}
            <p className="text-sm text-gray-600 mb-4 text-center">Cliente: {reportData.client === 'all' ? 'Todos' : reportData.client}</p>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-100">
                  {reportData.type === 'daily' ? (
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Funcionário</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Data</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Entrada</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Saída</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Total</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Cliente</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Etiqueta</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Comentário</th>
                    </tr>
                  ) : ( // Summary
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Funcionário</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Departamento</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Dias Trab.</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r">Total Horas</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Média Diária</th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data && reportData.data.length > 0 ? (
                    reportData.data.map((rec: any, index: number) => (
                      reportData.type === 'daily' ? (
                        <tr key={`${rec.employeeName}-${rec.date}-${index}-${Math.random()}`}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 border-r">{rec.employeeName}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.date}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.entryTime}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.exitTime}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{formatMinutesToHoursMinutes(rec.totalWorkTime)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.client}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.tag}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{rec.comment || ''}</td>
                        </tr>
                      ) : ( // Summary
                        <tr key={`${rec.id}-${index}-${Math.random()}`}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 border-r">{rec.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.department || '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.workedDays}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r">{rec.totalHoursFormatted}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{rec.avgHoursFormatted}</td>
                        </tr>
                      )
                    ))
                  ) : (
                    <tr>
                      <td colSpan={reportData.type === 'daily' ? 8 : 5} className="px-3 py-4 text-center text-sm text-gray-500">
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {reportData.type === 'summary' && reportData.chartData && (
              <div className="mt-8 p-4 border rounded bg-gray-50" style={{pageBreakInside: 'avoid'}}>
                <h3 className="text-lg font-semibold mb-4 text-center">Horas Trabalhadas por Funcionário</h3>
                <div style={{ position: 'relative', height: '400px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
                  <Bar options={chartOptions} data={reportData.chartData} />
                </div>
              </div>
            )}
          </div>
          {/* Fim do conteúdo para captura */}

          <div className="mt-6 flex justify-end space-x-2">
            <button onClick={() => downloadReport('pdf')} disabled={isDownloading} className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${isDownloading ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}>
              {isDownloading && downloadFormat === 'pdf' ? 'Baixando PDF...' : 'Baixar PDF'}
            </button>
            <button onClick={() => downloadReport('excel')} disabled={isDownloading} className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${isDownloading ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}>
              {isDownloading && downloadFormat === 'excel' ? 'Baixando Excel...' : 'Baixar Excel'}
            </button>
          </div>
        </div>
      )}

      {!reportGenerated && !isGenerating && (
        <p className="text-center text-gray-500 mt-6">Selecione os filtros e clique em "Gerar Informe".</p>
      )}
    </div>
  );
}

