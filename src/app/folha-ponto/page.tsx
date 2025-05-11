
'use client';

import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../lib/auth'; // Ajuste o caminho conforme necessário
import type { TimeRecord as ModelTimeRecord, Employee as ModelEmployee, Client as ModelClient } from '../../lib/time-tracking-models'; // Importando os modelos centrais

// --- Tipos Adaptados para a Página (se necessário, mas idealmente usar os modelos centrais) ---
interface TimeRecord extends ModelTimeRecord {}
interface Employee extends ModelEmployee {}
interface Client extends ModelClient {}

interface GroupedRecords {
  [date: string]: TimeRecord[];
}

// --- Ícones ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;

// --- Função Auxiliar para Calcular Total Diário ---
const calculateDailyTotal = (dailyRecords: TimeRecord[] | undefined): string => {
  if (!dailyRecords || dailyRecords.length === 0) return '';
  let totalMinutes = 0;
  dailyRecords.forEach(record => {
    if (record.totalWorkTime) { // Usar o campo numérico se disponível
        totalMinutes += record.totalWorkTime;
    } else if (record.startTime && record.endTime) { // Calcular se tiver início e fim
        try {
            const start = new Date(`2000-01-01T${record.startTime}:00`);
            const end = new Date(`2000-01-01T${record.endTime}:00`);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                totalMinutes += (end.getTime() - start.getTime()) / 60000;
            }
        } catch (e) { console.error("Erro ao calcular totalWorkTime para registro:", record, e); }
    }
  });
  if (totalMinutes === 0) return '';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let totalString = '[Total: ';
  if (hours > 0) totalString += `${hours}h `;
  if (minutes > 0 || hours === 0) totalString += `${minutes}m`;
  totalString += ']';
  return totalString.trim();
};

// --- Componente Principal ---
export default function FolhaPontoPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentUserData, setCurrentUserData] = useState<Employee | null>(null);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [allClients, setAllClients] = useState<Client[]>([]);
  const [availableClientsForTimesheet, setAvailableClientsForTimesheet] = useState<Client[]>([]);

  // Adição Manual (Modal)
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualClientId, setManualClientId] = useState('');
  const [manualTag, setManualTag] = useState(''); // Mantido para compatibilidade, mas pode ser removido/alterado
  const [manualCustomTag, setManualCustomTag] = useState('');
  const [showManualCustomTag, setShowManualCustomTag] = useState(false);
  const [manualComment, setManualComment] = useState('');

  // Edição Inline
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TimeRecord>>({});

  // Adição Inline
  const [addingInlineDate, setAddingInlineDate] = useState<string | null>(null);
  const [addInlineFormData, setAddInlineFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'totalWorkTime' | 'status'>>>({});

  // Edição em Massa
  const [selectedDays, setSelectedDays] = useState<string[]>([]); 
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditFormData, setBulkEditFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'totalWorkTime' | 'status' | 'date' | 'usedEntryTolerance' | 'usedExitTolerance'>>>({ clientId: '' });
  const [bulkEditShowCustomTag, setBulkEditShowCustomTag] = useState(false);

  const tags = ['Desenvolvimento', 'Design', 'Reunião', 'Suporte', 'Administrativo', 'Outro'];

  // Carregar todos os clientes e dados do funcionário
  useEffect(() => {
    if (authLoading) return;
    setIsLoading(true);
    try {
      const storedClients = localStorage.getItem('timetracker_clients');
      const activeClients = storedClients ? (JSON.parse(storedClients) as Client[]).filter(c => c.status === 'active') : [];
      setAllClients(activeClients);

      if (user?.id) {
        const storedEmployees = localStorage.getItem('timetracker_employees');
        if (storedEmployees) {
          const employees: Employee[] = JSON.parse(storedEmployees);
          const foundUser = employees.find(emp => emp.id === user.id);
          if (foundUser) {
            setCurrentUserData(foundUser);
            setRecords(sortRecords(foundUser.timeRecords || []));
            
            // Determinar clientes disponíveis para este usuário
            if (user.role === 'admin') {
              setAvailableClientsForTimesheet(activeClients);
            } else if (foundUser.assignedClientIds && foundUser.assignedClientIds.length > 0) {
              const userClients = activeClients.filter(client => foundUser.assignedClientIds?.includes(client.id));
              setAvailableClientsForTimesheet(userClients);
            } else {
              setAvailableClientsForTimesheet(activeClients); // Ou [] se preferir que não apareça nenhum se não atribuído
            }
            // Definir cliente padrão para novos registros
            const defaultClient = foundUser.defaultClientId || (activeClients.length > 0 ? activeClients[0].id : '');
            setManualClientId(defaultClient);
            setAddInlineFormData(prev => ({ ...prev, clientId: defaultClient }));
            setBulkEditFormData(prev => ({ ...prev, clientId: defaultClient }));

          } else {
             setAvailableClientsForTimesheet(activeClients); // Admin ou usuário não encontrado nos employees, mostra todos
          }
        }
      } else {
        // Usuário não logado ou sem ID, mostrar todos os clientes ativos (ou nenhum)
        setAvailableClientsForTimesheet(activeClients);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
    setIsLoading(false);
  }, [user, authLoading]);

  const saveRecordsToStorage = (updatedRecords: TimeRecord[]) => {
    if (!user?.id || !currentUserData) return;
    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      const employeeIndex = employees.findIndex(emp => emp.id === user.id);
      
      const recordsWithIdsAndNumericTotal = updatedRecords.map(rec => {
        let totalWorkTime = 0;
        if (rec.startTime && rec.endTime) {
            const start = new Date(`2000-01-01T${rec.startTime}:00`);
            const end = new Date(`2000-01-01T${rec.endTime}:00`);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                totalWorkTime = (end.getTime() - start.getTime()) / 60000; // em minutos
            }
        }
        return {
             ...rec, 
             id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             totalWorkTime: totalWorkTime,
             // Garantir que clientTag não seja usado, e sim clientId
             clientTag: undefined 
        };
      });

      if (employeeIndex === -1) {
        // Isso não deveria acontecer se currentUserData está setado
        employees.push({ ...currentUserData, timeRecords: recordsWithIdsAndNumericTotal });
      } else {
        employees[employeeIndex].timeRecords = recordsWithIdsAndNumericTotal;
      }
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));
      setRecords(sortRecords(recordsWithIdsAndNumericTotal));
    } catch (error) { console.error('Erro ao salvar registros:', error); alert('Erro ao salvar registros.'); }
  };

  const sortRecords = (recordsToSort: TimeRecord[]): TimeRecord[] => {
    return [...recordsToSort].sort((a, b) => {
      try {
        const dateA = new Date(`${a.date.split('/').reverse().join('-')}T${a.startTime}:00`);
        const dateB = new Date(`${b.date.split('/').reverse().join('-')}T${b.startTime}:00`);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) return dateB.getTime() - dateA.getTime();
      } catch (e) { console.error("Erro ao ordenar registros:", e); }
      return 0;
    });
  };

  // --- Filtros e Agrupamentos (sem alterações) ---
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      try {
        const [day, month, year] = record.date.split('/').map(Number);
        return (month - 1) === selectedMonth && year === selectedYear;
      } catch (e) { console.error('Erro ao parsear data para filtro:', record.date, e); return false; }
    });
  }, [records, selectedMonth, selectedYear]);

  const groupedRecords = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
      if (!acc[record.date]) acc[record.date] = [];
      acc[record.date].push(record);
      // Ordenar dentro do dia por hora de entrada
      acc[record.date].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      return acc;
    }, {} as GroupedRecords);
  }, [filteredRecords]);

  const daysInMonth = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const days: { date: Date, dateString: string }[] = [];
    while (date.getMonth() === selectedMonth) {
      days.push({ date: new Date(date), dateString: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) });
      date.setDate(date.getDate() + 1);
    }
    return days.sort((a,b) => b.date.getTime() - a.date.getTime()); // Ordenar dias em ordem decrescente
  }, [selectedMonth, selectedYear]);

  // --- Adição Manual (Modal) ---
  const handleManualTagChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setManualTag(value);
    setShowManualCustomTag(value === 'Outro');
  };
  const resetManualForm = () => {
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualStartTime(''); setManualEndTime(''); 
    setManualClientId(currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : ''));
    setManualTag(''); setManualCustomTag(''); setShowManualCustomTag(false); setManualComment('');
    setShowAddModal(false);
  };
  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualDate || !manualStartTime || !manualEndTime || !manualClientId || !manualTag || (manualTag === 'Outro' && !manualCustomTag)) { alert('Preencha todos os campos obrigatórios.'); return; }
    const finalTag = manualTag === 'Outro' ? manualCustomTag : manualTag;
    const start = new Date(`${manualDate}T${manualStartTime}:00`);
    const end = new Date(`${manualDate}T${manualEndTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) { alert('Horas de início e fim inválidas.'); return; }
    
    const formattedDate = new Date(manualDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const newRecord: Partial<TimeRecord> = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user!.id,
      date: formattedDate, 
      startTime: manualStartTime, 
      endTime: manualEndTime,
      status: 'Manual',
      clientId: manualClientId, 
      clientTag: finalTag, // Mantendo clientTag para o campo 'tag' que já existia. Renomear se necessário.
      comment: manualComment,
      usedEntryTolerance: false,
      usedExitTolerance: false
    };
    saveRecordsToStorage([...records, newRecord as TimeRecord]);
    alert(`Registro adicionado.`);
    resetManualForm();
  };

  // --- Edição Inline ---
  const handleEditClick = (record: TimeRecord) => {
    setEditingRecordId(record.id);
    setEditFormData({ 
        ...record, 
        customTag: record.clientTag === 'Outro' ? record.comment : '' // Assumindo que customTag era armazenado em comment antes
    });
    setAddingInlineDate(null);
    setSelectedDays([]);
  };
  const handleCancelEdit = () => { setEditingRecordId(null); setEditFormData({}); };
  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveEdit = () => {
    if (!editingRecordId || !editFormData.startTime || !editFormData.endTime || !editFormData.clientId || !editFormData.clientTag) { alert('Dados inválidos para salvar.'); return; }
    if (editFormData.clientTag === 'Outro' && !editFormData.customTag) { alert('Insira a etiqueta personalizada.'); return; }
    
    const finalTag = editFormData.clientTag === 'Outro' ? editFormData.customTag || '' : editFormData.clientTag;
    const updatedRecords = records.map(rec => {
      if (rec.id === editingRecordId) {
        return { 
            ...rec, 
            startTime: editFormData.startTime || rec.startTime, 
            endTime: editFormData.endTime || rec.endTime, 
            clientId: editFormData.clientId || rec.clientId, 
            clientTag: finalTag, // Mantendo clientTag
            comment: editFormData.comment, 
        } as TimeRecord;
      }
      return rec;
    });
    saveRecordsToStorage(updatedRecords);
    setEditingRecordId(null); setEditFormData({});
    alert('Registro atualizado!');
  };
  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      saveRecordsToStorage(records.filter(rec => rec.id !== recordId));
      alert('Registro excluído!');
    }
  };

  // --- Adição Inline ---
  const handleStartAddInline = (dateString: string) => {
    setAddingInlineDate(dateString);
    setAddInlineFormData({
         date: dateString, 
         clientId: currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : ''), 
         clientTag: '', 
         userId: user!.id,
         usedEntryTolerance: false,
         usedExitTolerance: false
    });
    setEditingRecordId(null);
    setSelectedDays([]);
  };
  const handleCancelAddInline = () => { setAddingInlineDate(null); setAddInlineFormData({}); };
  const handleAddInlineFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddInlineFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveAddInline = () => {
    if (!addingInlineDate || !addInlineFormData.startTime || !addInlineFormData.endTime || !addInlineFormData.clientId || !addInlineFormData.clientTag) { alert('Preencha todos os campos obrigatórios.'); return; }
    if (addInlineFormData.clientTag === 'Outro' && !addInlineFormData.customTag) { alert('Insira a etiqueta personalizada.'); return; }
    
    const finalTag = addInlineFormData.clientTag === 'Outro' ? addInlineFormData.customTag || '' : addInlineFormData.clientTag;
    const newRecord: Partial<TimeRecord> = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user!.id,
      date: addingInlineDate,
      startTime: addInlineFormData.startTime,
      endTime: addInlineFormData.endTime,
      status: 'Manual',
      clientId: addInlineFormData.clientId,
      clientTag: finalTag, // Mantendo clientTag
      comment: addInlineFormData.comment,
      usedEntryTolerance: false,
      usedExitTolerance: false
    };
    saveRecordsToStorage([...records, newRecord as TimeRecord]);
    setAddingInlineDate(null); setAddInlineFormData({});
    alert('Novo registro adicionado!');
  };

  // --- Edição em Massa ---
  const handleDaySelectionChange = (dateString: string, isSelected: boolean) => {
    setSelectedDays(prev => isSelected ? [...prev, dateString] : prev.filter(d => d !== dateString));
    setEditingRecordId(null); 
    setAddingInlineDate(null);
  };

  const handleOpenBulkEditModal = () => {
    if (selectedDays.length === 0) {
        alert("Selecione pelo menos um dia para edição em massa.");
        return;
    }
    setBulkEditFormData({ 
        clientId: currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : ''), 
        clientTag: '' 
    });
    setBulkEditShowCustomTag(false);
    setShowBulkEditModal(true);
  };

  const handleBulkEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBulkEditFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'clientTag') setBulkEditShowCustomTag(value === 'Outro');
  };

  const resetBulkEditForm = () => {
    setShowBulkEditModal(false);
    setBulkEditFormData({ clientId: currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : ''), clientTag: '' });
    setBulkEditShowCustomTag(false);
    //setSelectedDays([]); // Não limpar seleção aqui, para permitir múltiplas edições em massa se necessário
  };

  const handleBulkEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bulkEditFormData.clientId || !bulkEditFormData.clientTag || (bulkEditFormData.clientTag === 'Outro' && !bulkEditFormData.customTag)) {
      alert("Preencha os campos de cliente e etiqueta para edição em massa.");
      return;
    }
    const finalTag = bulkEditFormData.clientTag === 'Outro' ? bulkEditFormData.customTag || '' : bulkEditFormData.clientTag;
    const updatedRecords = records.map(rec => {
      if (selectedDays.includes(rec.date)) {
        return { 
            ...rec, 
            clientId: bulkEditFormData.clientId, 
            clientTag: finalTag, // Mantendo clientTag
            comment: bulkEditFormData.comment !== undefined ? bulkEditFormData.comment : rec.comment // Atualiza comentário apenas se fornecido
        } as TimeRecord;
      }
      return rec;
    });
    saveRecordsToStorage(updatedRecords);
    alert("Registros selecionados atualizados com sucesso!");
    resetBulkEditForm();
    setSelectedDays([]); // Limpar seleção após sucesso
  };

  // --- Renderização ---
  if (isLoading || authLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Carregando dados da folha de ponto...</div>;
  }

  if (!isAuthenticated) {
    return <div className="container mx-auto px-4 py-8 text-center">Acesso negado. Por favor, faça login.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Folha de Ponto</h1>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="p-2 border rounded-md shadow-sm bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-2 border rounded-md shadow-sm bg-white"
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center transition duration-150 ease-in-out"
          >
            <AddIcon /> Adicionar Manual
          </button>
        </div>
      </div>

      {selectedDays.length > 0 && (
        <div className="mb-4 flex justify-end">
            <button 
                onClick={handleOpenBulkEditModal}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
            >
                Editar Selecionados ({selectedDays.length} dia(s))
            </button>
        </div>
      )}

      {/* Modal de Adição Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Adicionar Registro Manual</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="manualDate" className="block text-sm font-medium text-gray-700">Data</label>
                <input type="date" id="manualDate" value={manualDate} onChange={e => setManualDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="manualStartTime" className="block text-sm font-medium text-gray-700">Entrada</label>
                  <input type="time" id="manualStartTime" value={manualStartTime} onChange={e => setManualStartTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="manualEndTime" className="block text-sm font-medium text-gray-700">Saída</label>
                  <input type="time" id="manualEndTime" value={manualEndTime} onChange={e => setManualEndTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label htmlFor="manualClientId" className="block text-sm font-medium text-gray-700">Cliente</label>
                <select id="manualClientId" name="manualClientId" value={manualClientId} onChange={e => setManualClientId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">Selecione um cliente</option>
                  {availableClientsForTimesheet.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="manualTag" className="block text-sm font-medium text-gray-700">Etiqueta (Projeto/Tarefa)</label>
                <select id="manualTag" value={manualTag} onChange={handleManualTagChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">Selecione uma etiqueta</option>
                  {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
              {showManualCustomTag && (
                <div>
                  <label htmlFor="manualCustomTag" className="block text-sm font-medium text-gray-700">Etiqueta Personalizada</label>
                  <input type="text" id="manualCustomTag" value={manualCustomTag} onChange={e => setManualCustomTag(e.target.value)} required={manualTag === 'Outro'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              )}
              <div>
                <label htmlFor="manualComment" className="block text-sm font-medium text-gray-700">Comentário (Opcional)</label>
                <textarea id="manualComment" value={manualComment} onChange={e => setManualComment(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={resetManualForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md border border-transparent">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição em Massa */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Editar Registros Selecionados ({selectedDays.length} dia(s))</h2>
            <form onSubmit={handleBulkEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="bulkEditClientId" className="block text-sm font-medium text-gray-700">Novo Cliente</label>
                <select id="bulkEditClientId" name="clientId" value={bulkEditFormData.clientId} onChange={handleBulkEditFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">Selecione um cliente</option>
                  {availableClientsForTimesheet.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bulkEditTag" className="block text-sm font-medium text-gray-700">Nova Etiqueta (Projeto/Tarefa)</label>
                <select id="bulkEditTag" name="clientTag" value={bulkEditFormData.clientTag} onChange={handleBulkEditFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">Selecione uma etiqueta</option>
                  {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
              {bulkEditShowCustomTag && (
                <div>
                  <label htmlFor="bulkEditCustomTag" className="block text-sm font-medium text-gray-700">Etiqueta Personalizada</label>
                  <input type="text" id="bulkEditCustomTag" name="customTag" value={bulkEditFormData.customTag} onChange={handleBulkEditFormChange} required={bulkEditFormData.clientTag === 'Outro'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              )}
              <div>
                <label htmlFor="bulkEditComment" className="block text-sm font-medium text-gray-700">Novo Comentário (Opcional - sobrescreverá existentes)</label>
                <textarea id="bulkEditComment" name="comment" value={bulkEditFormData.comment || ''} onChange={handleBulkEditFormChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={resetBulkEditForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md border border-transparent">Aplicar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Registros */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {daysInMonth.length === 0 && !isLoading && (
            <p className="p-6 text-center text-gray-500">Nenhum registro encontrado para este mês.</p>
          )}
          {daysInMonth.map(({ date, dateString }) => {
            const dailyRecords = groupedRecords[dateString];
            const isDaySelected = selectedDays.includes(dateString);
            return (
              <div key={dateString} className={`mb-1 ${isDaySelected ? 'bg-blue-50' : ''}`}>
                <div className={`flex justify-between items-center p-3 border-b border-gray-200 ${dailyRecords && dailyRecords.length > 0 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        checked={isDaySelected}
                        onChange={(e) => handleDaySelectionChange(dateString, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-700">
                      {dateString} <span className="text-sm font-normal text-gray-500">({date.toLocaleDateString('pt-BR', { weekday: 'long' })})</span>
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-4">{calculateDailyTotal(dailyRecords)}</span>
                    {addingInlineDate !== dateString && (
                        <button 
                            onClick={() => handleStartAddInline(dateString)}
                            className="text-sm bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-1 px-3 rounded-md flex items-center transition duration-150 ease-in-out"
                        >
                            <AddIcon /> Adicionar Linha
                        </button>
                    )}
                  </div>
                </div>
                
                {dailyRecords && dailyRecords.length > 0 && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Entrada</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Saída</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiqueta</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentário</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyRecords.map((record) => (
                        editingRecordId === record.id ? (
                          // Linha de Edição Inline
                          <tr key={`${record.id}-edit`} className="bg-yellow-50">
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input type="time" name="startTime" value={editFormData.startTime || ''} onChange={handleEditFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm" />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input type="time" name="endTime" value={editFormData.endTime || ''} onChange={handleEditFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm" />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{/* Total é calculado no save */}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <select name="clientId" value={editFormData.clientId || ''} onChange={handleEditFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm bg-white">
                                <option value="">Selecione</option>
                                {availableClientsForTimesheet.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <select name="clientTag" value={editFormData.clientTag || ''} onChange={e => {handleEditFormChange(e); if(e.target.value !== 'Outro') setEditFormData(prev => ({...prev, customTag: ''})) }} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm bg-white">
                                <option value="">Selecione</option>
                                {tags.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              {editFormData.clientTag === 'Outro' && 
                                <input type="text" name="customTag" placeholder="Etiqueta Específica" value={editFormData.customTag || ''} onChange={handleEditFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm" />
                              }
                            </td>
                            <td className="px-4 py-2">
                              <textarea name="comment" value={editFormData.comment || ''} onChange={handleEditFormChange} rows={1} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"></textarea>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-900"><SaveIcon /></button>
                                <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-900"><CancelIcon /></button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          // Linha de Visualização
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{record.startTime}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{record.endTime}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {record.totalWorkTime ? `${Math.floor(record.totalWorkTime / 60)}h ${record.totalWorkTime % 60}m` : '-'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{allClients.find(c=>c.id === record.clientId)?.name || record.clientId || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{record.clientTag}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate" title={record.comment}>{record.comment}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button onClick={() => handleEditClick(record)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                                <button onClick={() => handleDeleteRecord(record.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                              </div>
                            </td>
                          </tr>
                        )
                      ))}
                      
                      {/* Linha de Adição Inline */}
                      {addingInlineDate === dateString && (
                        <tr className="bg-green-50">
                           <td className="px-4 py-2 whitespace-nowrap">
                              <input type="time" name="startTime" value={addInlineFormData.startTime || ''} onChange={handleAddInlineFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm" />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input type="time" name="endTime" value={addInlineFormData.endTime || ''} onChange={handleAddInlineFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm" />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"></td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <select name="clientId" value={addInlineFormData.clientId || ''} onChange={handleAddInlineFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm bg-white">
                                <option value="">Selecione</option>
                                {availableClientsForTimesheet.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <select name="clientTag" value={addInlineFormData.clientTag || ''} onChange={e => {handleAddInlineFormChange(e); if(e.target.value !== 'Outro') setAddInlineFormData(prev => ({...prev, customTag: ''})) }} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm bg-white">
                                <option value="">Selecione</option>
                                {tags.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              {addInlineFormData.clientTag === 'Outro' && 
                                <input type="text" name="customTag" placeholder="Etiqueta Específica" value={addInlineFormData.customTag || ''} onChange={handleAddInlineFormChange} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm" />
                              }
                            </td>
                            <td className="px-4 py-2">
                              <textarea name="comment" value={addInlineFormData.comment || ''} onChange={handleAddInlineFormChange} rows={1} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"></textarea>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button onClick={handleSaveAddInline} className="text-green-600 hover:text-green-900"><SaveIcon /></button>
                                <button onClick={handleCancelAddInline} className="text-red-600 hover:text-red-900"><CancelIcon /></button>
                              </div>
                            </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                {(!dailyRecords || dailyRecords.length === 0) && addingInlineDate !== dateString && (
                    <p className="px-4 py-3 text-sm text-gray-500">Nenhum registro para este dia.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

