
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { useAuth } from '../hooks/useAuth';
import {
    getEmployeesData,
    getAllTimeRecordsData,
    getUniqueClients,
    parseDateString,
    formatMinutesToHoursMinutes,
    TimeRecord,
    Employee,
    calculateReportStats,
} from './page_helpers';

import { dailyReportFields, summaryReportFields, ReportFieldOption } from './report_fields_config';

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
import Image from 'next/image';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DailyReportRecord {
    employeeName?: string;
    date: string;
    entryTime: string;
    exitTime: string;
    totalWorkTime: number;
    client: string;
    funcao: string;
    comment?: string;
    employeeId?: string;
    department?: string;
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

interface SelectedFields {
  [key: string]: boolean;
}

interface ReportStats {
    totalHoursWorked: string;
    totalDaysWorked: number;
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
  const [showFieldSelection, setShowFieldSelection] = useState(false);
  const [selectedFields, setSelectedFields] = useState<SelectedFields>({});
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);

  const reportContentRef = useRef<HTMLDivElement>(null);

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
        
        initializeSelectedFields(reportType);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    }
  }, [user, isAdmin]);

  const loadSelectedFieldsFromStorage = (type: string): SelectedFields | null => {
    if (typeof window !== 'undefined') {
      const storedFields = localStorage.getItem(`report_${type}_selectedFields`);
      if (storedFields) {
        return JSON.parse(storedFields);
      }
    }
    return null;
  };

  const saveSelectedFieldsToStorage = (type: string, fields: SelectedFields) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`report_${type}_selectedFields`, JSON.stringify(fields));
    }
  };

  const initializeSelectedFields = (type: string) => {
    const storedFields = loadSelectedFieldsFromStorage(type);
    if (storedFields) {
      setSelectedFields(storedFields);
    } else {
      const fieldsConfig = type === 'daily' ? dailyReportFields : summaryReportFields;
      const initialSelectedFields: SelectedFields = {};
      if (fieldsConfig && Array.isArray(fieldsConfig)) {
        fieldsConfig.forEach(field => {
          initialSelectedFields[field.id] = field.defaultSelected;
        });
      } else {
        console.error(`Erro Crítico: A configuração de campos (fieldsConfig) para o tipo de relatório '${type}' não foi encontrada ou não é um array. Verifique a importação de dailyReportFields e summaryReportFields.`);
      }
      setSelectedFields(initialSelectedFields);
      saveSelectedFieldsToStorage(type, initialSelectedFields);
    }
  };

  useEffect(() => {
    initializeSelectedFields(reportType);
  }, [reportType]);

  const handleFieldSelectionChange = (fieldId: string) => {
    const newSelectedFields = {
      ...selectedFields,
      [fieldId]: !selectedFields[fieldId],
    };
    setSelectedFields(newSelectedFields);
    saveSelectedFieldsToStorage(reportType, newSelectedFields);
  };

  const generateReportData = (type: string, range: string, employeeIdFilter: string, selectedClientFilter: string, isCustomRange: boolean, customStartDateStr: string, customEndDateStr: string) => {
    const allTimeRecords = getAllTimeRecordsData();
    if (!allTimeRecords || allTimeRecords.length === 0) {
        return { type, data: [], chartData: null, startDate: '', endDate: '', employee: employeeIdFilter, client: selectedClientFilter, stats: null };
    }
    const now = new Date();
    let filterStartDate = new Date();
    let filterEndDate = new Date(now);

    if (isCustomRange && customStartDateStr && customEndDateStr) {
      filterStartDate = new Date(customStartDateStr + 'T00:00:00');
      filterEndDate = new Date(customEndDateStr + 'T23:59:59');
    } else {
      switch (range) {
        case 'today':
            filterStartDate = new Date(new Date().setHours(0, 0, 0, 0));
            filterEndDate = new Date(new Date().setHours(23, 59, 59, 999));
            break;
        case 'yesterday':
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            filterStartDate = new Date(yesterday.setHours(0, 0, 0, 0));
            filterEndDate = new Date(yesterday.setHours(23, 59, 59, 999));
            break;
        case 'current_week':
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Adjust for Sunday as start or Monday
            filterStartDate = new Date(currentWeekStart.setHours(0,0,0,0));
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
            filterEndDate = new Date(currentWeekEnd.setHours(23,59,59,999));
            break;
        case 'last_week':
            const lastWeekEnd = new Date(now);
            lastWeekEnd.setDate(now.getDate() - now.getDay() - (now.getDay() === 0 ? 0 : 1) + (now.getDay() === 0 ? 0 : 0) ); // Last day of last week (Saturday or Sunday)
            lastWeekEnd.setHours(23,59,59,999);
            const lastWeekStart = new Date(lastWeekEnd);
            lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
            lastWeekStart.setHours(0,0,0,0);
            filterStartDate = lastWeekStart;
            filterEndDate = lastWeekEnd;
            break;
        case 'current_month':
        default:
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'last_month': 
            filterStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0,0,0,0);
            filterEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999);
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
    let calculatedStats: ReportStats | null = null;

    if (type === 'daily') {
        const employeeReportMap: Record<string, { name: string; id?: string; department?: string; records: Omit<DailyReportRecord, 'employeeName' | 'employeeId' | 'department'>[] }> = {};
        filteredRecords.forEach(record => {
            const userId = record.userId;
            if (!userId) return;
            if (!employeeReportMap[userId]) {
                const employee = allEmployeesList.find(emp => emp.id === userId);
                employeeReportMap[userId] = { 
                    name: employee ? employee.name : `ID: ${userId}`, 
                    id: employee?.id,
                    department: employee?.department,
                    records: [] 
                };
            }
            employeeReportMap[userId].records.push({
                date: record.date,
                entryTime: record.entryTime || record.entry,
                exitTime: record.exitTime || record.exit,
                totalWorkTime: record.totalWorkTime || 0,
                client: record.client,
                funcao: record.funcao || record.tag,
                comment: record.comment
            });
        });
        finalData = Object.values(employeeReportMap).flatMap(data => {
            data.records.sort((a, b) => {
                const dateA = parseDateString(a.date);
                const dateB = parseDateString(b.date);
                return dateB && dateA ? dateB.getTime() - dateA.getTime() : 0;
            });
            return data.records.map(record => ({ 
                ...record, 
                employeeName: data.name,
                employeeId: data.id,
                department: data.department
            }));
        });
        calculatedStats = calculateReportStats(filteredRecords, allEmployeesList, employeeIdFilter);
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
        calculatedStats = calculateReportStats(filteredRecords, allEmployeesList, employeeIdFilter);
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
      chartData: chartData,
      selectedFields: selectedFields,
      stats: calculatedStats
    };
  };

  const generateReport = () => {
    setIsGenerating(true);
    setReportGenerated(false);
    setReportData(null);
    setReportStats(null);
    setTimeout(() => {
      try {
        const data = generateReportData(reportType, dateRange, employeeFilter, clientFilter, customDateRange, startDate, endDate);
        setReportData(data);
        setReportStats(data.stats);
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
    const reportTitle = `Relatorio_${reportData.type}_${reportData.employee === 'all' ? 'TodosFuncionarios' : reportData.employee}_${reportData.client === 'all' ? 'TodosClientes' : reportData.client}_${reportData.startDate}_a_${reportData.endDate}`.replace(/[^a-zA-Z0-9_]/g, '-');

    try {
        if (format === 'pdf') {
            const canvas = await html2canvas(reportContentRef.current, { 
                scale: 2,
                logging: true,
                useCORS: true,
                windowWidth: reportContentRef.current.scrollWidth,
                windowHeight: reportContentRef.current.scrollHeight
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 5;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
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
            const currentFieldsConfigExcel = reportData.type === 'daily' ? dailyReportFields : summaryReportFields;
            
            const headers = (currentFieldsConfigExcel || [])
                .filter(field => reportData.selectedFields[field.id])
                .map(field => field.label);
            ws_data.push(headers);
            
            if (reportData.type === 'daily') {
                reportData.data.forEach((rec: DailyReportRecord) => {
                    const row: any[] = [];
                    (currentFieldsConfigExcel || []).forEach(field => {
                        if (reportData.selectedFields[field.id]) {
                            switch (field.id) {
                                case 'employeeName': row.push(rec.employeeName || '-'); break;
                                case 'date': row.push(rec.date); break;
                                case 'entryTime': row.push(rec.entryTime); break;
                                case 'exitTime': row.push(rec.exitTime); break;
                                case 'totalWorkTime': row.push(formatMinutesToHoursMinutes(rec.totalWorkTime)); break;
                                case 'client': row.push(rec.client); break;
                                case 'funcao': row.push(rec.funcao); break;
                                case 'comment': row.push(rec.comment || ''); break;
                                default: row.push('');
                            }
                        }
                    });
                    ws_data.push(row);
                });
            } else { // Summary
                reportData.data.forEach((rec: SummaryReportRecord) => {
                    const row: any[] = [];
                     (currentFieldsConfigExcel || []).forEach(field => {
                        if (reportData.selectedFields[field.id]) {
                            switch (field.id) {
                                case 'name': row.push(rec.name); break;
                                case 'department': row.push(rec.department || '-'); break;
                                case 'workedDays': row.push(rec.workedDays); break;
                                case 'totalHoursFormatted': row.push(rec.totalHoursFormatted); break;
                                case 'avgHoursFormatted': row.push(rec.avgHoursFormatted); break;
                                default: row.push('');
                            }
                        }
                    });
                    ws_data.push(row);
                });
            }
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
            XLSX.writeFile(wb, `${reportTitle}.xlsx`);
        }
    } catch (error) {
        console.error("Erro ao baixar o relatório:", error);
        alert("Ocorreu um erro ao tentar baixar o relatório.");
    } finally {
        setIsDownloading(false);
        setDownloadFormat('');
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; bgColor?: string }> = ({ title, value, bgColor = 'bg-gray-100' }) => (
    <div className={`p-4 rounded-lg shadow-md ${bgColor} text-center`}>
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  const renderReportContent = () => {
    if (!reportGenerated || !reportData) return <p className="text-center text-gray-500">Nenhum relatório gerado. Por favor, configure e clique em "Gerar Relatório".</p>;
    if (reportData.data.length === 0) return <p className="text-center text-gray-500">Nenhum dado encontrado para os filtros selecionados.</p>;    

    const currentFieldsConfigRender = reportData.type === 'daily' ? dailyReportFields : summaryReportFields;
    const activeFields = (currentFieldsConfigRender || []).filter(field => reportData.selectedFields[field.id]);

    const employeeDetails = reportData.employee !== 'all' ? employees.find(e => e.id === reportData.employee) : null;

    return (
      <div ref={reportContentRef} className="p-6 bg-white rounded-lg shadow-xl">
        {/* Report Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">
                    Relatório {reportData.type === 'daily' ? 'Diário Detalhado' : 'Resumido de Horas'}
                </h2>
                <Image src="/images/company_logo.jpg" alt="Logo da Empresa" width={100} height={40} className="object-contain"/>
            </div>
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                <p><strong>Período:</strong> {reportData.startDate} a {reportData.endDate}</p>
                {isAdmin && <p><strong>Funcionário:</strong> {reportData.employee === 'all' ? 'Todos' : employeeDetails?.name || reportData.employee}</p>}
                <p><strong>Cliente:</strong> {reportData.client === 'all' ? 'Todos' : reportData.client}</p>
                <p><strong>Gerado em:</strong> {new Date(reportData.generatedAt).toLocaleString('pt-BR')}</p>
            </div>
        </div>

        {/* Employee Info Section - Inspired by reference */}
        {reportData.employee !== 'all' && employeeDetails && (
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Detalhes do Funcionário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p><strong>ID:</strong> {employeeDetails.id}</p>
                    <p><strong>Nome:</strong> {employeeDetails.name}</p>
                    <p><strong>Email:</strong> {employeeDetails.email}</p>
                    <p><strong>Departamento:</strong> {employeeDetails.department || 'N/A'}</p>
                </div>
            </div>
        )}

        {/* Stats Cards Section */}
        {reportStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Horas Trabalhadas" value={reportStats.totalHoursWorked} bgColor="bg-blue-100" />
                <StatCard title="Total Dias Trabalhados" value={reportStats.totalDaysWorked} bgColor="bg-green-100" />
            </div>
        )}

        {/* Report Table / Chart */}
        {reportData.type === 'daily' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(activeFields || []).map(field => (
                    <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data.map((rec: DailyReportRecord, index: number) => (
                  <tr key={index}>
                    {(activeFields || []).map(field => (
                      <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {field.id === 'totalWorkTime' ? formatMinutesToHoursMinutes(rec.totalWorkTime) : (rec as any)[field.id] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {reportData.type === 'summary' && reportData.chartData && (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Gráfico de Horas por Funcionário</h3>
            <Bar options={{ responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Total de Horas Trabalhadas por Funcionário' } } }} data={reportData.chartData} />
            <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {(activeFields || []).map(field => (
                                <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {field.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.data.map((rec: SummaryReportRecord, index: number) => (
                        <tr key={index}>
                            {(activeFields || []).map(field => (
                                <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {(rec as any)[field.id] || '-'}
                                </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentFieldsForSelection = reportType === 'daily' ? dailyReportFields : summaryReportFields;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">Relatórios</h1>

      {/* Filters and Field Selection Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        {/* Report Type */}
        <div className="col-span-1 md:col-span-1">
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
          <select id="reportType" value={reportType} onChange={e => setReportType(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="daily">Diário Detalhado</option>
            <option value="summary">Resumo de Horas</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="col-span-1 md:col-span-1">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <select id="dateRange" value={dateRange} onChange={e => { setDateRange(e.target.value); setCustomDateRange(e.target.value === 'custom'); }} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="current_month">Mês Atual</option>
            <option value="last_month">Mês Anterior</option>
            <option value="current_week">Semana Atual</option>
            <option value="last_week">Semana Anterior</option>
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* Custom Date Inputs */}
        {customDateRange && (
          <>
            <div className="col-span-1 md:col-span-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div className="col-span-1 md:col-span-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </>
        )}

        {/* Employee Filter (Admin only) */}
        {isAdmin && (
          <div className="col-span-1 md:col-span-1">
            <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
            <select id="employeeFilter" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="all">Todos Funcionários</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
        )}

        {/* Client Filter */}
        <div className="col-span-1 md:col-span-1">
          <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select id="clientFilter" value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="all">Todos Clientes</option>
            {clients.map(client => <option key={client} value={client}>{client}</option>)}
          </select>
        </div>

        {/* Field Selection Toggle Button */}
        <div className="col-span-1 md:col-span-full flex items-end">
            <button 
                onClick={() => setShowFieldSelection(!showFieldSelection)} 
                className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                {showFieldSelection ? 'Ocultar Opções de Campos' : 'Selecionar Campos do Relatório'}
            </button>
        </div>
      </div>

      {/* Field Selection Checkboxes (Collapsible) */}
      {showFieldSelection && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione os campos para o relatório {reportType === 'daily' ? 'Diário' : 'Resumido'}:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(currentFieldsForSelection || []).map((field: ReportFieldOption) => (
              <div key={field.id} className="flex items-center">
                <input
                  id={`field-${field.id}`}
                  name={`field-${field.id}`}
                  type="checkbox"
                  checked={selectedFields[field.id] || false}
                  onChange={() => handleFieldSelectionChange(field.id)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`field-${field.id}`} className="ml-2 block text-sm text-gray-900">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Report Button */}
      <div className="mb-6 text-center">
        <button onClick={generateReport} disabled={isGenerating} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
          {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </div>

      {/* Report Display Area */}
      {reportGenerated && reportData && (
        <div className="mt-6">
          {renderReportContent()}
          {/* Download Buttons */}
          {reportData.data.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button onClick={() => downloadReport('pdf')} disabled={isDownloading && downloadFormat === 'pdf'} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300">
                    {isDownloading && downloadFormat === 'pdf' ? 'Baixando PDF...' : 'Baixar como PDF'}
                </button>
                <button onClick={() => downloadReport('excel')} disabled={isDownloading && downloadFormat === 'excel'} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300">
                    {isDownloading && downloadFormat === 'excel' ? 'Baixando Excel...' : 'Baixar como Excel'}
                </button>
            </div>
          )}
        </div>
      )}
      {!reportGenerated && !isGenerating && (
         <div className="text-center text-gray-500 mt-8 p-6 bg-white rounded-lg shadow">
            <p>Configure os filtros e clique em "Gerar Relatório" para visualizar os dados.</p>
        </div>
      )}
    </div>
  );
}

