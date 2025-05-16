
// Interface para as opções de campos selecionáveis
export interface ReportFieldOption {
  id: string;
  label: string;
  defaultSelected: boolean;
}

// Definição dos campos disponíveis para cada tipo de relatório
export const dailyReportFields: ReportFieldOption[] = [
  { id: "employeeName", label: "Funcionário", defaultSelected: true },
  { id: "date", label: "Data", defaultSelected: true },
  { id: "entryTime", label: "Entrada", defaultSelected: true },
  { id: "exitTime", label: "Saída", defaultSelected: true },
  { id: "totalWorkTime", label: "Total Horas", defaultSelected: true },
  { id: "client", label: "Cliente", defaultSelected: true },
  { id: "funcao", label: "Função", defaultSelected: true }, // Alterado de tag para funcao
  { id: "comment", label: "Comentário", defaultSelected: false },
];

export const summaryReportFields: ReportFieldOption[] = [
  { id: "name", label: "Funcionário", defaultSelected: true },
  { id: "department", label: "Departamento", defaultSelected: true },
  { id: "workedDays", label: "Dias Trabalhados", defaultSelected: true },
  { id: "totalHoursFormatted", label: "Total Horas", defaultSelected: true },
  { id: "avgHoursFormatted", label: "Média Diária", defaultSelected: true },
];

