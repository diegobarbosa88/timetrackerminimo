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
  if (!dailyRecords || dailyRecords.length === 0) return "";
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
  if (totalMinutes === 0) return "";
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
  const [addInlineFormData, setAddInlineFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'totalWorkTime' | 'status'>> & { customFuncaoInput?: string } >({});

  // Edição em Massa
  const [selectedDays, setSelectedDays] = useState<string[]>([]); 
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditFormData, setBulkEditFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'totalWorkTime' | 'status' | 'date' | 'usedEntryTolerance' | 'usedExitTolerance'>> & { customFuncaoInput?: string, startTime?: string, endTime?: string } >({ clientId: '', funcaoId: '', startTime: '', endTime: '' });
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
            setBulkEditFormData(prev => ({ ...prev, clientId: defaultClient, funcaoId: defaultFuncao, startTime: '', endTime: '' }));

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
    
    if (name === 'funcaoId') {
      const funcaoSelecionada = allFuncoes.find(f => f.id === value);
      const isOutraFuncao = funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false;
      
      if (!isOutraFuncao) {
        setEditFormData(prev => ({ ...prev, [name]: value, customFuncaoInput: '' }));
      } else {
        setEditFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editFormData.startTime || !editFormData.endTime || !editFormData.clientId || !editFormData.funcaoId) {
      alert('Preencha todos os campos obrigatórios (Início, Fim, Cliente, Função).');
      return;
    }
    
    const funcaoSelecionada = allFuncoes.find(f => f.id === editFormData.funcaoId);
    const isOutraFuncao = funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false;
    
    if (isOutraFuncao && !editFormData.customFuncaoInput) {
      alert('Por favor, especifique a função personalizada.');
      return;
    }
    
    const start = new Date(`2000-01-01T${editFormData.startTime}:00`);
    const end = new Date(`2000-01-01T${editFormData.endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      alert('Horas de início e fim inválidas.');
      return;
    }
    
    const updatedRecords = records.map(record => {
      if (record.id === editingRecordId) {
        const { customFuncaoInput, ...restOfEditData } = editFormData;
        return {
          ...record,
          ...restOfEditData,
          comment: isOutraFuncao ? customFuncaoInput : editFormData.comment || ''
        };
      }
      return record;
    });
    
    saveRecordsToStorage(updatedRecords);
    setEditingRecordId(null);
    setEditFormData({});
  };
  const handleEditCancel = () => {
    setEditingRecordId(null);
    setEditFormData({});
  };
  const handleDeleteClick = (recordId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      const updatedRecords = records.filter(record => record.id !== recordId);
      saveRecordsToStorage(updatedRecords);
    }
  };

  // --- Adição Inline ---
  const handleAddInlineClick = (dateString: string) => {
    setAddingInlineDate(dateString);
    setAddInlineFormData({
      date: dateString,
      startTime: '',
      endTime: '',
      clientId: currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : ''),
      funcaoId: currentUserData?.defaultFuncaoId || (availableFuncoesForTimesheet.length > 0 ? availableFuncoesForTimesheet[0].id : ''),
      customFuncaoInput: '',
      comment: ''
    });
    setEditingRecordId(null);
    setSelectedDays([]);
  };
  const handleAddInlineChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'funcaoId') {
      const funcaoSelecionada = allFuncoes.find(f => f.id === value);
      const isOutraFuncao = funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false;
      
      if (!isOutraFuncao) {
        setAddInlineFormData(prev => ({ ...prev, [name]: value, customFuncaoInput: '' }));
      } else {
        setAddInlineFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setAddInlineFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleAddInlineSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!addInlineFormData.startTime || !addInlineFormData.endTime || !addInlineFormData.clientId || !addInlineFormData.funcaoId) {
      alert('Preencha todos os campos obrigatórios (Início, Fim, Cliente, Função).');
      return;
    }
    
    const funcaoSelecionada = allFuncoes.find(f => f.id === addInlineFormData.funcaoId);
    const isOutraFuncao = funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false;
    
    if (isOutraFuncao && !addInlineFormData.customFuncaoInput) {
      alert('Por favor, especifique a função personalizada.');
      return;
    }
    
    const start = new Date(`2000-01-01T${addInlineFormData.startTime}:00`);
    const end = new Date(`2000-01-01T${addInlineFormData.endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      alert('Horas de início e fim inválidas.');
      return;
    }
    
    const { customFuncaoInput, ...restOfFormData } = addInlineFormData;
    
    const newRecord: Partial<TimeRecord> = {
      id: `rec-inline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user!.id,
      status: 'Manual',
      ...restOfFormData,
      comment: isOutraFuncao ? customFuncaoInput : addInlineFormData.comment || '',
      usedEntryTolerance: false,
      usedExitTolerance: false
    };
    
    saveRecordsToStorage([...records, newRecord as TimeRecord]);
    setAddingInlineDate(null);
    setAddInlineFormData({});
  };
  const handleAddInlineCancel = () => {
    setAddingInlineDate(null);
    setAddInlineFormData({});
  };

  // --- Edição em Massa ---
  const handleDaySelectionChange = (dateString: string) => {
    setSelectedDays(prev => {
      if (prev.includes(dateString)) {
        return prev.filter(d => d !== dateString);
      } else {
        return [...prev, dateString];
      }
    });
    setEditingRecordId(null);
    setAddingInlineDate(null);
  };
  const handleBulkEditClick = () => {
    if (selectedDays.length === 0) {
      alert('Selecione pelo menos um dia para edição em massa.');
      return;
    }
    setBulkEditFormData({
      startTime: '',
      endTime: '',
      clientId: currentUserData?.defaultClientId || (availableClientsForTimesheet.length > 0 ? availableClientsForTimesheet[0].id : ''),
      funcaoId: currentUserData?.defaultFuncaoId || (availableFuncoesForTimesheet.length > 0 ? availableFuncoesForTimesheet[0].id : ''),
      customFuncaoInput: '',
      comment: ''
    });
    setBulkEditShowCustomFuncaoInput(false);
    setShowBulkEditModal(true);
  };
  const handleBulkEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'funcaoId') {
      const funcaoSelecionada = allFuncoes.find(f => f.id === value);
      const isOutraFuncao = funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false;
      
      setBulkEditShowCustomFuncaoInput(isOutraFuncao);
      
      if (!isOutraFuncao) {
        setBulkEditFormData(prev => ({ ...prev, [name]: value, customFuncaoInput: '' }));
      } else {
        setBulkEditFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setBulkEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleBulkEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validar campos de hora (ambos devem estar preenchidos ou ambos vazios)
    if ((!bulkEditFormData.startTime && bulkEditFormData.endTime) || (bulkEditFormData.startTime && !bulkEditFormData.endTime)) {
      alert('Nova Hora Início e Nova Hora Fim são obrigatórias para edição em massa.');
      return;
    }
    
    // Validar horas se ambas estiverem preenchidas
    if (bulkEditFormData.startTime && bulkEditFormData.endTime) {
      const start = new Date(`2000-01-01T${bulkEditFormData.startTime}:00`);
      const end = new Date(`2000-01-01T${bulkEditFormData.endTime}:00`);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        alert('Horas de início e fim inválidas.');
        return;
      }
    }
    
    // Validar função personalizada se "Outra" estiver selecionada
    const funcaoSelecionada = allFuncoes.find(f => f.id === bulkEditFormData.funcaoId);
    const isOutraFuncao = funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false;
    
    if (isOutraFuncao && bulkEditFormData.funcaoId && !bulkEditFormData.customFuncaoInput) {
      alert('Por favor, especifique a função personalizada.');
      return;
    }
    
    // Aplicar edições em massa
    let updatedRecords = [...records];
    
    selectedDays.forEach(dateString => {
      const dayRecords = updatedRecords.filter(record => record.date === dateString);
      
      if (dayRecords.length > 0) {
        updatedRecords = updatedRecords.map(record => {
          if (record.date === dateString) {
            const updates: Partial<TimeRecord> = {};
            
            // Atualizar apenas os campos que foram preenchidos
            if (bulkEditFormData.startTime && bulkEditFormData.endTime) {
              updates.startTime = bulkEditFormData.startTime;
              updates.endTime = bulkEditFormData.endTime;
            }
            
            if (bulkEditFormData.clientId) {
              updates.clientId = bulkEditFormData.clientId;
            }
            
            if (bulkEditFormData.funcaoId) {
              updates.funcaoId = bulkEditFormData.funcaoId;
              
              if (isOutraFuncao) {
                updates.comment = bulkEditFormData.customFuncaoInput || '';
              } else if (bulkEditFormData.comment !== undefined) {
                updates.comment = bulkEditFormData.comment;
              }
            } else if (bulkEditFormData.comment !== undefined) {
              updates.comment = bulkEditFormData.comment;
            }
            
            return { ...record, ...updates };
          }
          return record;
        });
      } else {
        // Se não houver registros para o dia, criar um novo
        if (bulkEditFormData.startTime && bulkEditFormData.endTime && bulkEditFormData.clientId && bulkEditFormData.funcaoId) {
          const newRecord: Partial<TimeRecord> = {
            id: `rec-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${dateString}`,
            userId: user!.id,
            date: dateString,
            startTime: bulkEditFormData.startTime,
            endTime: bulkEditFormData.endTime,
            status: 'Manual',
            clientId: bulkEditFormData.clientId,
            funcaoId: bulkEditFormData.funcaoId,
            comment: isOutraFuncao ? bulkEditFormData.customFuncaoInput : bulkEditFormData.comment || '',
            usedEntryTolerance: false,
            usedExitTolerance: false
          };
          
          updatedRecords.push(newRecord as TimeRecord);
        }
      }
    });
    
    saveRecordsToStorage(updatedRecords);
    setShowBulkEditModal(false);
    setSelectedDays([]);
    setBulkEditFormData({});
  };

  // --- Renderização ---
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Acesso Restrito</h1>
          <p className="text-gray-600 mb-4 text-center">Você precisa estar logado para acessar a folha de ponto.</p>
          <div className="flex justify-center">
            <a href="/auth/login" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-300">
              Fazer Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Folha de Ponto</h1>
      
      {/* Filtros e Controles */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition duration-300"
            >
              <AddIcon /> Adicionar Registro Manual
            </button>
            {selectedDays.length > 0 && (
              <button
                onClick={handleBulkEditClick}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Editar {selectedDays.length} Dia(s) Selecionado(s)
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabela de Registros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <span className="sr-only">Selecionar</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {daysInMonth.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    Nenhum dia encontrado para o mês e ano selecionados.
                  </td>
                </tr>
              ) : (
                daysInMonth.map(({ dateString }) => {
                  const dayRecords = groupedRecords[dateString] || [];
                  const isSelected = selectedDays.includes(dateString);
                  const isEditing = addingInlineDate === dateString;
                  
                  return (
                    <tr key={dateString} className={isSelected ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDaySelectionChange(dateString)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(dateString.split('/').reverse().join('-')).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-4">
                          {/* Registros do dia */}
                          {dayRecords.length > 0 ? (
                            <div className="space-y-3">
                              {dayRecords.map(record => (
                                <div key={record.id} className="bg-gray-50 p-3 rounded-md">
                                  {editingRecordId === record.id ? (
                                    // Formulário de edição inline
                                    <form onSubmit={handleEditSubmit} className="space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Hora Início</label>
                                          <input
                                            type="time"
                                            name="startTime"
                                            value={editFormData.startTime || ''}
                                            onChange={handleEditChange}
                                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Hora Fim</label>
                                          <input
                                            type="time"
                                            name="endTime"
                                            value={editFormData.endTime || ''}
                                            onChange={handleEditChange}
                                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
                                          <select
                                            name="clientId"
                                            value={editFormData.clientId || ''}
                                            onChange={handleEditChange}
                                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          >
                                            <option value="">Selecione um cliente</option>
                                            {availableClientsForTimesheet.map(client => (
                                              <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Função</label>
                                          <select
                                            name="funcaoId"
                                            value={editFormData.funcaoId || ''}
                                            onChange={handleEditChange}
                                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          >
                                            <option value="">Selecione uma função</option>
                                            {availableFuncoesForTimesheet.map(funcao => (
                                              <option key={funcao.id} value={funcao.id}>{funcao.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                      
                                      {/* Campo para função personalizada */}
                                      {editFormData.funcaoId && allFuncoes.find(f => f.id === editFormData.funcaoId)?.name.toLowerCase() === 'outra' && (
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Especifique a Função</label>
                                          <input
                                            type="text"
                                            name="customFuncaoInput"
                                            value={editFormData.customFuncaoInput || ''}
                                            onChange={handleEditChange}
                                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Desenvolvimento Frontend"
                                            required
                                          />
                                        </div>
                                      )}
                                      
                                      {/* Campo de comentário (apenas se não for "Outra" função) */}
                                      {(!editFormData.funcaoId || allFuncoes.find(f => f.id === editFormData.funcaoId)?.name.toLowerCase() !== 'outra') && (
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Comentário (opcional)</label>
                                          <textarea
                                            name="comment"
                                            value={editFormData.comment || ''}
                                            onChange={handleEditChange}
                                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={2}
                                          />
                                        </div>
                                      )}
                                      
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          type="button"
                                          onClick={handleEditCancel}
                                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md flex items-center text-sm transition duration-300"
                                        >
                                          <CancelIcon /> Cancelar
                                        </button>
                                        <button
                                          type="submit"
                                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md flex items-center text-sm transition duration-300"
                                        >
                                          <SaveIcon /> Salvar
                                        </button>
                                      </div>
                                    </form>
                                  ) : (
                                    // Visualização do registro
                                    <div>
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">
                                              {record.startTime} - {record.endTime}
                                            </span>
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                              {record.status}
                                            </span>
                                          </div>
                                          <div className="mt-1 text-sm text-gray-600">
                                            <span className="font-medium">Cliente:</span> {allClients.find(c => c.id === record.clientId)?.name || 'Desconhecido'}
                                          </div>
                                          <div className="mt-1 text-sm text-gray-600">
                                            <span className="font-medium">Função:</span> {allFuncoes.find(f => f.id === record.funcaoId)?.name || 'Desconhecida'}
                                            {record.comment && (
                                              <span className="ml-2 text-gray-500 italic">
                                                {allFuncoes.find(f => f.id === record.funcaoId)?.name.toLowerCase() === 'outra' 
                                                  ? `(${record.comment})` 
                                                  : `- ${record.comment}`}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex space-x-1">
                                          <button
                                            onClick={() => handleEditClick(record)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition duration-300"
                                            title="Editar"
                                          >
                                            <EditIcon />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteClick(record.id)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition duration-300"
                                            title="Excluir"
                                          >
                                            <DeleteIcon />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div className="text-right text-sm font-medium text-gray-700">
                                {calculateDailyTotal(dayRecords)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">Nenhum registro para este dia.</div>
                          )}
                          
                          {/* Formulário de adição inline */}
                          {isEditing ? (
                            <form onSubmit={handleAddInlineSubmit} className="mt-3 bg-blue-50 p-3 rounded-md space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora Início</label>
                                  <input
                                    type="time"
                                    name="startTime"
                                    value={addInlineFormData.startTime || ''}
                                    onChange={handleAddInlineChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora Fim</label>
                                  <input
                                    type="time"
                                    name="endTime"
                                    value={addInlineFormData.endTime || ''}
                                    onChange={handleAddInlineChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
                                  <select
                                    name="clientId"
                                    value={addInlineFormData.clientId || ''}
                                    onChange={handleAddInlineChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  >
                                    <option value="">Selecione um cliente</option>
                                    {availableClientsForTimesheet.map(client => (
                                      <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Função</label>
                                  <select
                                    name="funcaoId"
                                    value={addInlineFormData.funcaoId || ''}
                                    onChange={handleAddInlineChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  >
                                    <option value="">Selecione uma função</option>
                                    {availableFuncoesForTimesheet.map(funcao => (
                                      <option key={funcao.id} value={funcao.id}>{funcao.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              {/* Campo para função personalizada */}
                              {addInlineFormData.funcaoId && allFuncoes.find(f => f.id === addInlineFormData.funcaoId)?.name.toLowerCase() === 'outra' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Especifique a Função</label>
                                  <input
                                    type="text"
                                    name="customFuncaoInput"
                                    value={addInlineFormData.customFuncaoInput || ''}
                                    onChange={handleAddInlineChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Desenvolvimento Frontend"
                                    required
                                  />
                                </div>
                              )}
                              
                              {/* Campo de comentário (apenas se não for "Outra" função) */}
                              {(!addInlineFormData.funcaoId || allFuncoes.find(f => f.id === addInlineFormData.funcaoId)?.name.toLowerCase() !== 'outra') && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Comentário (opcional)</label>
                                  <textarea
                                    name="comment"
                                    value={addInlineFormData.comment || ''}
                                    onChange={handleAddInlineChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                  />
                                </div>
                              )}
                              
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={handleAddInlineCancel}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md flex items-center text-sm transition duration-300"
                                >
                                  <CancelIcon /> Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md flex items-center text-sm transition duration-300"
                                >
                                  <SaveIcon /> Adicionar
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button
                              onClick={() => handleAddInlineClick(dateString)}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
                              <AddIcon /> Adicionar registro
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Adição Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Adicionar Registro Manual</h2>
                <button
                  onClick={resetManualForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="manual-date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      id="manual-date"
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="manual-client" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <select
                      id="manual-client"
                      value={manualClientId}
                      onChange={(e) => setManualClientId(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {availableClientsForTimesheet.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="manual-start-time" className="block text-sm font-medium text-gray-700 mb-1">Hora Início</label>
                    <input
                      id="manual-start-time"
                      type="time"
                      value={manualStartTime}
                      onChange={(e) => setManualStartTime(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="manual-end-time" className="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
                    <input
                      id="manual-end-time"
                      type="time"
                      value={manualEndTime}
                      onChange={(e) => setManualEndTime(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="manual-funcao" className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                    <select
                      id="manual-funcao"
                      value={manualFuncaoId}
                      onChange={handleManualFuncaoChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma função</option>
                      {availableFuncoesForTimesheet.map(funcao => (
                        <option key={funcao.id} value={funcao.id}>{funcao.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Campo para função personalizada */}
                {showManualCustomFuncaoInput && (
                  <div>
                    <label htmlFor="manual-custom-funcao" className="block text-sm font-medium text-gray-700 mb-1">Especifique a Função</label>
                    <input
                      id="manual-custom-funcao"
                      type="text"
                      value={manualCustomFuncaoInput}
                      onChange={(e) => setManualCustomFuncaoInput(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Desenvolvimento Frontend"
                      required
                    />
                  </div>
                )}
                
                {/* Campo de comentário (apenas se não for "Outra" função) */}
                {!showManualCustomFuncaoInput && (
                  <div>
                    <label htmlFor="manual-comment" className="block text-sm font-medium text-gray-700 mb-1">Comentário (opcional)</label>
                    <textarea
                      id="manual-comment"
                      value={manualComment}
                      onChange={(e) => setManualComment(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={resetManualForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Edição em Massa */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Editar {selectedDays.length} Dia(s) Selecionado(s)</h2>
                <button
                  onClick={() => setShowBulkEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleBulkEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bulk-start-time" className="block text-sm font-medium text-gray-700 mb-1">Nova Hora Início</label>
                    <input
                      id="bulk-start-time"
                      type="time"
                      name="startTime"
                      value={bulkEditFormData.startTime || ''}
                      onChange={handleBulkEditChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-end-time" className="block text-sm font-medium text-gray-700 mb-1">Nova Hora Fim</label>
                    <input
                      id="bulk-end-time"
                      type="time"
                      name="endTime"
                      value={bulkEditFormData.endTime || ''}
                      onChange={handleBulkEditChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-client" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <select
                      id="bulk-client"
                      name="clientId"
                      value={bulkEditFormData.clientId || ''}
                      onChange={handleBulkEditChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um cliente</option>
                      {availableClientsForTimesheet.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bulk-funcao" className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                    <select
                      id="bulk-funcao"
                      name="funcaoId"
                      value={bulkEditFormData.funcaoId || ''}
                      onChange={handleBulkEditChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma função</option>
                      {availableFuncoesForTimesheet.map(funcao => (
                        <option key={funcao.id} value={funcao.id}>{funcao.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Campo para função personalizada */}
                {bulkEditShowCustomFuncaoInput && (
                  <div>
                    <label htmlFor="bulk-custom-funcao" className="block text-sm font-medium text-gray-700 mb-1">Especifique a Função</label>
                    <input
                      id="bulk-custom-funcao"
                      type="text"
                      name="customFuncaoInput"
                      value={bulkEditFormData.customFuncaoInput || ''}
                      onChange={handleBulkEditChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Desenvolvimento Frontend"
                    />
                  </div>
                )}
                
                {/* Campo de comentário (apenas se não for "Outra" função) */}
                {!bulkEditShowCustomFuncaoInput && (
                  <div>
                    <label htmlFor="bulk-comment" className="block text-sm font-medium text-gray-700 mb-1">Comentário (opcional)</label>
                    <textarea
                      id="bulk-comment"
                      name="comment"
                      value={bulkEditFormData.comment || ''}
                      onChange={handleBulkEditChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkEditModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                  >
                    Aplicar a {selectedDays.length} Dia(s)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
