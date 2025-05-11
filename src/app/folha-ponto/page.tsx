
"use client";

import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../lib/auth';
import type { TimeRecord as ModelTimeRecord, Employee as ModelEmployee, Client as ModelClient, Funcao as ModelFuncao } from '../../lib/time-tracking-models';

// --- Tipos Adaptados para a Página ---
interface TimeRecord extends ModelTimeRecord {}
interface Employee extends ModelEmployee {}
interface Client extends ModelClient {}
interface Funcao extends ModelFuncao {}

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
    if (record.totalWorkTime) {
        totalMinutes += record.totalWorkTime;
    } else if (record.startTime && record.endTime) {
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
  const [allFuncoes, setAllFuncoes] = useState<Funcao[]>([]);
  const [availableFuncoesForTimesheet, setAvailableFuncoesForTimesheet] = useState<Funcao[]>([]);

  // Adição Manual (Modal)
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualClientId, setManualClientId] = useState('');
  const [manualFuncaoId, setManualFuncaoId] = useState('');
  const [manualCustomFuncaoInput, setManualCustomFuncaoInput] = useState('');
  const [showManualCustomFuncaoInput, setShowManualCustomFuncaoInput] = useState(false);
  const [manualComment, setManualComment] = useState('');

  // Edição Inline
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TimeRecord & { customFuncaoInput?: string }>>({});

  // Adição Inline
  const [addingInlineDate, setAddingInlineDate] = useState<string | null>(null);
  const [addInlineFormData, setAddInlineFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'totalWorkTime' | 'status'> & { customFuncaoInput?: string }>>({});

  // Edição em Massa
  const [selectedDays, setSelectedDays] = useState<string[]>([]); 
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditFormData, setBulkEditFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'totalWorkTime' | 'status' | 'date' | 'usedEntryTolerance' | 'usedExitTolerance'> & { customFuncaoInput?: string }>>({ clientId: '', funcaoId: '' });
  const [bulkEditShowCustomFuncaoInput, setBulkEditShowCustomFuncaoInput] = useState(false);

  // Carregar todos os clientes, funções e dados do funcionário
  useEffect(() => {
    if (authLoading) return;
    setIsLoading(true);
    try {
      const storedClients = localStorage.getItem('timetracker_clients');
      const activeClients = storedClients ? (JSON.parse(storedClients) as Client[]).filter(c => c.status === 'active') : [];
      setAllClients(activeClients);

      const storedFuncoes = localStorage.getItem('timetracker_funcoes');
      const activeFuncoes = storedFuncoes ? (JSON.parse(storedFuncoes) as Funcao[]).filter(f => f.status === 'active') : [];
      setAllFuncoes(activeFuncoes);

      if (user?.id) {
        const storedEmployees = localStorage.getItem('timetracker_employees');
        if (storedEmployees) {
          const employees: Employee[] = JSON.parse(storedEmployees);
          const foundUser = employees.find(emp => emp.id === user.id);
          if (foundUser) {
            setCurrentUserData(foundUser);
            setRecords(sortRecords(foundUser.timeRecords || []));
            
            let userSpecificClients = activeClients;
            if (user.role !== 'admin' && foundUser.assignedClientIds && foundUser.assignedClientIds.length > 0) {
              userSpecificClients = activeClients.filter(client => foundUser.assignedClientIds?.includes(client.id));
            }
            setAvailableClientsForTimesheet(userSpecificClients);

            let userSpecificFuncoes = activeFuncoes;
            if (user.role !== 'admin' && foundUser.assignedFuncaoIds && foundUser.assignedFuncaoIds.length > 0) {
              userSpecificFuncoes = activeFuncoes.filter(funcao => foundUser.assignedFuncaoIds?.includes(funcao.id));
            }
            setAvailableFuncoesForTimesheet(userSpecificFuncoes);
            
            const defaultClient = foundUser.defaultClientId || (userSpecificClients.length > 0 ? userSpecificClients[0].id : '');
            setManualClientId(defaultClient);
            const defaultFuncao = foundUser.defaultFuncaoId || (userSpecificFuncoes.length > 0 ? userSpecificFuncoes[0].id : '');
            setManualFuncaoId(defaultFuncao);
            
            setAddInlineFormData(prev => ({ ...prev, clientId: defaultClient, funcaoId: defaultFuncao }));
            setBulkEditFormData(prev => ({ ...prev, clientId: defaultClient, funcaoId: defaultFuncao }));

          } else {
             setAvailableClientsForTimesheet(activeClients);
             setAvailableFuncoesForTimesheet(activeFuncoes);
             if (activeClients.length > 0) setManualClientId(activeClients[0].id);
             if (activeFuncoes.length > 0) setManualFuncaoId(activeFuncoes[0].id);
          }
        }
      } else {
        setAvailableClientsForTimesheet(activeClients);
        setAvailableFuncoesForTimesheet(activeFuncoes);
        if (activeClients.length > 0) setManualClientId(activeClients[0].id);
        if (activeFuncoes.length > 0) setManualFuncaoId(activeFuncoes[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais da folha de ponto:', error);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); 

  const saveRecordsToStorage = (updatedRecords: TimeRecord[]) => {
    if (!user?.id || !currentUserData) return;
    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      const employeeIndex = employees.findIndex(emp => emp.id === user.id);
      
      const recordsToSave = updatedRecords.map(rec => {
        let totalWorkTime = 0;
        if (rec.startTime && rec.endTime) {
            const start = new Date(`2000-01-01T${rec.startTime}:00`);
            const end = new Date(`2000-01-01T${rec.endTime}:00`);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                totalWorkTime = (end.getTime() - start.getTime()) / 60000;
            }
        }
        const { clientTag, customTag, ...restOfRec } = rec as any;
        return {
             ...restOfRec,
             id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             totalWorkTime: totalWorkTime,
             funcaoId: rec.funcaoId,
             comment: rec.comment 
        };
      });

      if (employeeIndex === -1) {
        // Este caso não deveria acontecer se currentUserData está setado
        employees.push({ ...currentUserData, timeRecords: recordsToSave as TimeRecord[] });
      } else {
        employees[employeeIndex].timeRecords = recordsToSave as TimeRecord[];
      }
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));
      setRecords(sortRecords(recordsToSave as TimeRecord[]));
    } catch (error) { console.error('Erro ao salvar registros:', error); alert('Erro ao salvar registros.'); }
  };

  const sortRecords = (recordsToSort: TimeRecord[]): TimeRecord[] => {
    return [...recordsToSort].sort((a, b) => {
      try {
        const dateA = new Date(`${a.date.split('/').reverse().join('-')}T${a.startTime || '00:00'}:00`);
        const dateB = new Date(`${b.date.split('/').reverse().join('-')}T${b.startTime || '00:00'}:00`);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) return dateB.getTime() - dateA.getTime();
      } catch (e) { console.error("Erro ao ordenar registros:", e); }
      return 0;
    });
  };

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
    return days.sort((a,b) => b.date.getTime() - a.date.getTime()); // Ordena do mais recente para o mais antigo
  }, [selectedMonth, selectedYear]);

  // --- Adição Manual (Modal) ---
  const handleManualFuncaoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setManualFuncaoId(value);
    const funcaoSelecionada = allFuncoes.find(f => f.id === value);
    setShowManualCustomFuncaoInput(funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false);
    if (!funcaoSelecionada || funcaoSelecionada.name.toLowerCase() !== 'outra') {
      setManualCustomFuncaoInput('');
    }
  };
  const resetManualForm = () => {
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualStartTime(''); setManualEndTime(''); 
    setManualClientId(currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : ''));
    setManualFuncaoId(currentUserData?.defaultFuncaoId || (availableFuncoesForTimesheet.length > 0 ? availableFuncoesForTimesheet[0].id : ''));
    setManualCustomFuncaoInput(''); setShowManualCustomFuncaoInput(false); setManualComment('');
    setShowAddModal(false);
  };
  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualDate || !manualStartTime || !manualEndTime || !manualClientId || !manualFuncaoId) { alert('Preencha todos os campos obrigatórios (Data, Início, Fim, Cliente, Função).'); return; }
    const funcaoSelecionada = allFuncoes.find(f => f.id === manualFuncaoId);
    if (funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' && !manualCustomFuncaoInput) { alert('Por favor, especifique a função personalizada.'); return; }
    
    const start = new Date(`${manualDate}T${manualStartTime}:00`);
    const end = new Date(`${manualDate}T${manualEndTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) { alert('Horas de início e fim inválidas.'); return; }
    
    const formattedDate = new Date(manualDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const commentForRecord = funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' ? manualCustomFuncaoInput : manualComment;

    const newRecord: Partial<TimeRecord> = {
      id: `rec-manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user!.id,
      date: formattedDate, 
      startTime: manualStartTime, 
      endTime: manualEndTime,
      status: 'Manual',
      clientId: manualClientId, 
      funcaoId: manualFuncaoId,
      comment: commentForRecord,
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
    const funcaoDoRegistro = allFuncoes.find(f => f.id === record.funcaoId);
    const customFuncao = (funcaoDoRegistro && funcaoDoRegistro.name.toLowerCase() === 'outra' && record.comment) ? record.comment : '';
    setEditFormData({ 
        ...record, 
        customFuncaoInput: customFuncao
    });
    setAddingInlineDate(null);
    setSelectedDays([]);
  };
  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === 'funcaoId') {
            const funcaoSelecionada = allFuncoes.find(f => f.id === value);
            updated.customFuncaoInput = (funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra') ? prev.comment || '' : '';
        }
        return updated;
    });
  };
  const handleSaveEdit = (recordId: string) => {
    if (!editFormData.startTime || !editFormData.endTime || !editFormData.clientId || !editFormData.funcaoId) { alert('Preencha todos os campos obrigatórios (Início, Fim, Cliente, Função).'); return; }
    const funcaoSelecionada = allFuncoes.find(f => f.id === editFormData.funcaoId);
    if (funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' && !editFormData.customFuncaoInput) { alert('Por favor, especifique a função personalizada.'); return; }

    const start = new Date(`2000-01-01T${editFormData.startTime}:00`);
    const end = new Date(`2000-01-01T${editFormData.endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) { alert('Horas de início e fim inválidas.'); return; }

    const commentForRecord = funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' ? editFormData.customFuncaoInput : editFormData.comment;

    const updatedRecords = records.map(rec => 
      rec.id === recordId ? { ...rec, ...editFormData, comment: commentForRecord, id: rec.id } : rec
    );
    saveRecordsToStorage(updatedRecords as TimeRecord[]);
    setEditingRecordId(null);
  };
  const handleCancelEdit = () => setEditingRecordId(null);

  // --- Adição Inline ---
  const handleAddInlineClick = (date: string) => {
    setAddingInlineDate(date);
    setEditingRecordId(null);
    setSelectedDays([]);
    const defaultClient = currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : '');
    const defaultFuncao = currentUserData?.defaultFuncaoId || (availableFuncoesForTimesheet.length > 0 ? availableFuncoesForTimesheet[0].id : '');
    setAddInlineFormData({ 
        date: date, 
        startTime: '', 
        endTime: '', 
        clientId: defaultClient,
        funcaoId: defaultFuncao,
        comment: '',
        customFuncaoInput: '',
        usedEntryTolerance: false,
        usedExitTolerance: false
    });
  };
  const handleAddInlineChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAddInlineFormData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === 'funcaoId') {
            const funcaoSelecionada = allFuncoes.find(f => f.id === value);
            updated.customFuncaoInput = (funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra') ? '' : undefined;
        }
        return updated;
    });
  };
  const handleSaveAddInline = () => {
    if (!addInlineFormData.startTime || !addInlineFormData.endTime || !addInlineFormData.clientId || !addInlineFormData.funcaoId) { alert('Preencha todos os campos obrigatórios (Início, Fim, Cliente, Função).'); return; }
    const funcaoSelecionada = allFuncoes.find(f => f.id === addInlineFormData.funcaoId);
    if (funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' && !addInlineFormData.customFuncaoInput) { alert('Por favor, especifique a função personalizada.'); return; }

    const start = new Date(`2000-01-01T${addInlineFormData.startTime}:00`);
    const end = new Date(`2000-01-01T${addInlineFormData.endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) { alert('Horas de início e fim inválidas.'); return; }

    const commentForRecord = funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' ? addInlineFormData.customFuncaoInput : addInlineFormData.comment;

    const newRecord: Partial<TimeRecord> = {
      id: `rec-inline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user!.id,
      date: addInlineFormData.date!,
      startTime: addInlineFormData.startTime!,
      endTime: addInlineFormData.endTime!,
      status: 'Manual',
      clientId: addInlineFormData.clientId!,
      funcaoId: addInlineFormData.funcaoId!,
      comment: commentForRecord,
      usedEntryTolerance: false,
      usedExitTolerance: false
    };
    saveRecordsToStorage([...records, newRecord as TimeRecord]);
    setAddingInlineDate(null);
  };
  const handleCancelAddInline = () => setAddingInlineDate(null);

  // --- Exclusão ---
  const handleDeleteRecord = (recordId: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      const updatedRecords = records.filter(rec => rec.id !== recordId);
      saveRecordsToStorage(updatedRecords);
    }
  };

  // --- Edição em Massa ---
  const handleDaySelection = (dateString: string) => {
    setSelectedDays(prev => 
      prev.includes(dateString) ? prev.filter(d => d !== dateString) : [...prev, dateString]
    );
  };
  const handleBulkEditFuncaoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBulkEditFormData(prev => ({...prev, funcaoId: value}));
    const funcaoSelecionada = allFuncoes.find(f => f.id === value);
    setBulkEditShowCustomFuncaoInput(funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false);
    if (!funcaoSelecionada || funcaoSelecionada.name.toLowerCase() !== 'outra') {
        setBulkEditFormData(prev => ({...prev, customFuncaoInput: ''}));
    }
  };
  const handleBulkEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) { alert("Nenhum dia selecionado para edição em massa."); return; }
    if (!bulkEditFormData.clientId || !bulkEditFormData.funcaoId) { alert("Cliente e Função são obrigatórios para edição em massa."); return; }
    const funcaoSelecionada = allFuncoes.find(f => f.id === bulkEditFormData.funcaoId);
    if (funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' && !bulkEditFormData.customFuncaoInput) { alert('Por favor, especifique a função personalizada para edição em massa.'); return; }

    const commentForBulkRecord = funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' ? bulkEditFormData.customFuncaoInput : bulkEditFormData.comment;

    const updatedRecords = records.map(rec => {
      if (selectedDays.includes(rec.date)) {
        return {
          ...rec,
          clientId: bulkEditFormData.clientId,
          funcaoId: bulkEditFormData.funcaoId,
          comment: commentForBulkRecord || rec.comment // Mantém comentário original se não for 'Outra' ou se não houver novo comentário
        };
      }
      return rec;
    });
    saveRecordsToStorage(updatedRecords as TimeRecord[]);
    setShowBulkEditModal(false);
    setSelectedDays([]);
    // Resetar formulário de edição em massa para defaults do usuário
    const defaultClient = currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : '');
    const defaultFuncao = currentUserData?.defaultFuncaoId || (availableFuncoesForTimesheet.length > 0 ? availableFuncoesForTimesheet[0].id : '');
    setBulkEditFormData({ clientId: defaultClient, funcaoId: defaultFuncao, comment: '', customFuncaoInput: ''});
    setBulkEditShowCustomFuncaoInput(allFuncoes.find(f => f.id === defaultFuncao)?.name.toLowerCase() === 'outra');
  };

  // --- Renderização ---
  if (authLoading || isLoading) return <div className="container mx-auto px-4 py-8 text-center">Carregando...</div>;
  if (!isAuthenticated || !user) return <div className="container mx-auto px-4 py-8 text-center">Acesso negado. Faça login.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Folha de Ponto</h1>
        <div className="flex items-center gap-2">
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="p-2 border rounded-md shadow-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="p-2 border rounded-md shadow-sm">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <button 
            onClick={() => {
                resetManualForm(); 
                setShowAddModal(true);
                setAddingInlineDate(null);
                setEditingRecordId(null);
                setSelectedDays([]);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm flex items-center">
            <AddIcon /> Adicionar Registro Manual
        </button>
      </div>

      {selectedDays.length > 0 && (
        <div className="mb-4 flex justify-end">
            <button 
                onClick={() => {
                    setShowBulkEditModal(true);
                    setAddingInlineDate(null);
                    setEditingRecordId(null);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm">
                Editar {selectedDays.length} Dia(s) Selecionado(s)
            </button>
        </div>
      )}

      {/* Modal de Adição Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Adicionar Registro Manual</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="manualDate" className="block text-sm font-medium text-gray-700">Data</label>
                <input type="date" id="manualDate" value={manualDate} onChange={e => setManualDate(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="manualStartTime" className="block text-sm font-medium text-gray-700">Hora Início</label>
                  <input type="time" id="manualStartTime" value={manualStartTime} onChange={e => setManualStartTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="manualEndTime" className="block text-sm font-medium text-gray-700">Hora Fim</label>
                  <input type="time" id="manualEndTime" value={manualEndTime} onChange={e => setManualEndTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="manualClientId" className="block text-sm font-medium text-gray-700">Cliente</label>
                <select id="manualClientId" value={manualClientId} onChange={e => setManualClientId(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                  <option value="">Selecione um Cliente</option>
                  {availableClientsForTimesheet.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="manualFuncaoId" className="block text-sm font-medium text-gray-700">Função</label>
                <select id="manualFuncaoId" value={manualFuncaoId} onChange={handleManualFuncaoChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                  <option value="">Selecione uma Função</option>
                  {availableFuncoesForTimesheet.map(funcao => <option key={funcao.id} value={funcao.id}>{funcao.name}</option>)}
                </select>
              </div>
              {showManualCustomFuncaoInput && (
                <div>
                  <label htmlFor="manualCustomFuncaoInput" className="block text-sm font-medium text-gray-700">Especifique a Função "Outra"</label>
                  <input type="text" id="manualCustomFuncaoInput" value={manualCustomFuncaoInput} onChange={e => setManualCustomFuncaoInput(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
              )}
              <div>
                <label htmlFor="manualComment" className="block text-sm font-medium text-gray-700">Comentário Adicional</label>
                <textarea id="manualComment" value={manualComment} onChange={e => setManualComment(e.target.value)} rows={2} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={resetManualForm} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição em Massa */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Editar Registros de {selectedDays.length} Dia(s)</h2>
            <p className="text-sm text-gray-600 mb-1">Dias selecionados:</p>
            <ul className="list-disc list-inside mb-4 text-sm text-gray-500 max-h-20 overflow-y-auto">
                {selectedDays.map(day => <li key={day}>{day}</li>)}
            </ul>
            <form onSubmit={handleBulkEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="bulkEditClientId" className="block text-sm font-medium text-gray-700">Novo Cliente</label>
                <select id="bulkEditClientId" value={bulkEditFormData.clientId} onChange={e => setBulkEditFormData(prev => ({...prev, clientId: e.target.value}))} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                  <option value="">Selecione um Cliente</option>
                  {availableClientsForTimesheet.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="bulkEditFuncaoId" className="block text-sm font-medium text-gray-700">Nova Função</label>
                <select id="bulkEditFuncaoId" value={bulkEditFormData.funcaoId} onChange={handleBulkEditFuncaoChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                  <option value="">Selecione uma Função</option>
                  {availableFuncoesForTimesheet.map(funcao => <option key={funcao.id} value={funcao.id}>{funcao.name}</option>)}
                </select>
              </div>
              {bulkEditShowCustomFuncaoInput && (
                <div>
                  <label htmlFor="bulkEditCustomFuncaoInput" className="block text-sm font-medium text-gray-700">Especifique a Função "Outra"</label>
                  <input type="text" id="bulkEditCustomFuncaoInput" value={bulkEditFormData.customFuncaoInput || ''} onChange={e => setBulkEditFormData(prev => ({...prev, customFuncaoInput: e.target.value}))} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
              )}
              <div>
                <label htmlFor="bulkEditComment" className="block text-sm font-medium text-gray-700">Novo Comentário (Opcional)</label>
                <textarea id="bulkEditComment" value={bulkEditFormData.comment || ''} onChange={e => setBulkEditFormData(prev => ({...prev, comment: e.target.value}))} rows={2} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
                <p className="text-xs text-gray-500 mt-1">Se a função for "Outra", o texto acima será usado. Caso contrário, este comentário substituirá os existentes nos dias selecionados (se preenchido).</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => {setShowBulkEditModal(false); setSelectedDays([]);}} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Aplicar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Registros */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                <input 
                    type="checkbox" 
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedDays(daysInMonth.map(d => d.dateString));
                        } else {
                            setSelectedDays([]);
                        }
                    }}
                    checked={selectedDays.length === daysInMonth.length && daysInMonth.length > 0}
                    title="Selecionar/Deselecionar todos os dias do mês"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data <span className="text-gray-400 font-normal normal-case">(Dia da Semana)</span></th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registros <span className="text-gray-400 font-normal normal-case">(Início - Fim, Cliente, Função, Comentário)</span></th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {daysInMonth.map(({ date, dateString }) => {
              const dailyRecords = groupedRecords[dateString];
              const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' });
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isSelectedForBulk = selectedDays.includes(dateString);

              return (
                <React.Fragment key={dateString}>
                  <tr className={`${isWeekend ? 'bg-gray-50' : ''} ${isSelectedForBulk ? 'bg-indigo-50' : ''}`}>
                    <td className="px-2 py-4 whitespace-nowrap">
                        <input 
                            type="checkbox" 
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            checked={isSelectedForBulk}
                            onChange={() => handleDaySelection(dateString)}
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dateString}</div>
                      <div className={`text-xs ${isWeekend ? 'text-red-500' : 'text-gray-500'}`}>{dayOfWeek} {calculateDailyTotal(dailyRecords)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {dailyRecords && dailyRecords.length > 0 ? (
                        dailyRecords.map(record => (
                          editingRecordId === record.id ? (
                            // Formulário de Edição Inline
                            <div key={record.id} className="p-3 my-2 border border-indigo-300 rounded-md bg-indigo-50 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <input type="time" name="startTime" value={editFormData.startTime || ''} onChange={handleEditChange} className="p-1 border rounded-md text-sm w-full" />
                                <input type="time" name="endTime" value={editFormData.endTime || ''} onChange={handleEditChange} className="p-1 border rounded-md text-sm w-full" />
                              </div>
                              <select name="clientId" value={editFormData.clientId || ''} onChange={handleEditChange} className="p-1 border rounded-md text-sm w-full bg-white">
                                <option value="">Cliente...</option>
                                {availableClientsForTimesheet.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <select name="funcaoId" value={editFormData.funcaoId || ''} onChange={handleEditChange} className="p-1 border rounded-md text-sm w-full bg-white">
                                <option value="">Função...</option>
                                {availableFuncoesForTimesheet.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                              </select>
                              {(allFuncoes.find(f => f.id === editFormData.funcaoId)?.name.toLowerCase() === 'outra') && (
                                <input type="text" name="customFuncaoInput" placeholder="Especifique Outra Função" value={editFormData.customFuncaoInput || ''} onChange={handleEditChange} className="p-1 border rounded-md text-sm w-full" />
                              )}
                              <textarea name="comment" value={editFormData.comment || ''} onChange={handleEditChange} placeholder="Comentário..." rows={1} className="p-1 border rounded-md text-sm w-full"></textarea>
                              <div className="flex justify-end space-x-2 mt-1">
                                <button onClick={() => handleSaveEdit(record.id)} className="p-1 text-green-600 hover:text-green-800"><SaveIcon /></button>
                                <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:text-red-800"><CancelIcon /></button>
                              </div>
                            </div>
                          ) : (
                            // Visualização do Registro
                            <div key={record.id} className="text-sm text-gray-700 py-1 flex justify-between items-center group">
                              <div>
                                <span className="font-medium">{record.startTime} - {record.endTime}</span>
                                <span className="text-gray-500"> ({Math.floor((record.totalWorkTime || 0) / 60)}h { (record.totalWorkTime || 0) % 60}m)</span><br/>
                                <span className="text-xs text-indigo-700">{allClients.find(c => c.id === record.clientId)?.name || record.clientId}</span>
                                <span className="text-xs text-purple-700 ml-2">{allFuncoes.find(f => f.id === record.funcaoId)?.name || record.funcaoId}</span>
                                {record.comment && <span className="text-xs text-gray-500 block italic">L: {record.comment}</span>}
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                                <button onClick={() => handleEditClick(record)} className="p-1 text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                <button onClick={() => handleDeleteRecord(record.id)} className="p-1 text-red-600 hover:text-red-800"><DeleteIcon /></button>
                              </div>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="text-sm text-gray-400 italic">Nenhum registro neste dia.</div>
                      )}
                      {/* Formulário de Adição Inline */}
                      {addingInlineDate === dateString && (
                         <div className="p-3 my-2 border border-green-300 rounded-md bg-green-50 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input type="time" name="startTime" value={addInlineFormData.startTime || ''} onChange={handleAddInlineChange} className="p-1 border rounded-md text-sm w-full" placeholder="Início"/>
                                <input type="time" name="endTime" value={addInlineFormData.endTime || ''} onChange={handleAddInlineChange} className="p-1 border rounded-md text-sm w-full" placeholder="Fim"/>
                            </div>
                            <select name="clientId" value={addInlineFormData.clientId || ''} onChange={handleAddInlineChange} className="p-1 border rounded-md text-sm w-full bg-white">
                                <option value="">Cliente...</option>
                                {availableClientsForTimesheet.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select name="funcaoId" value={addInlineFormData.funcaoId || ''} onChange={handleAddInlineChange} className="p-1 border rounded-md text-sm w-full bg-white">
                                <option value="">Função...</option>
                                {availableFuncoesForTimesheet.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                            {(allFuncoes.find(f => f.id === addInlineFormData.funcaoId)?.name.toLowerCase() === 'outra') && (
                                <input type="text" name="customFuncaoInput" placeholder="Especifique Outra Função" value={addInlineFormData.customFuncaoInput || ''} onChange={handleAddInlineChange} className="p-1 border rounded-md text-sm w-full" />
                            )}
                            <textarea name="comment" value={addInlineFormData.comment || ''} onChange={handleAddInlineChange} placeholder="Comentário..." rows={1} className="p-1 border rounded-md text-sm w-full"></textarea>
                            <div className="flex justify-end space-x-2 mt-1">
                                <button onClick={handleSaveAddInline} className="p-1 text-green-600 hover:text-green-800"><SaveIcon /></button>
                                <button onClick={handleCancelAddInline} className="p-1 text-red-600 hover:text-red-800"><CancelIcon /></button>
                            </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {addingInlineDate !== dateString && editingRecordId === null && (
                        <button 
                            onClick={() => handleAddInlineClick(dateString)} 
                            className="text-indigo-600 hover:text-indigo-900 text-xs p-1 rounded hover:bg-indigo-50 flex items-center">
                            <AddIcon /> Adicionar
                        </button>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
            {daysInMonth.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">
                        Nenhum dia encontrado para este mês/ano.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

