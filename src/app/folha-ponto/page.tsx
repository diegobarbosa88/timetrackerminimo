
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../lib/auth'; // Ajuste o caminho conforme necessário

// --- Tipos ---
interface TimeRecord {
  id: string;
  date: string; // Formato DD/MM/YYYY
  entry: string; // Formato HH:MM
  exit: string; // Formato HH:MM
  total: string; // Formato Xh Ym
  status: string;
  client: string;
  tag: string;
  comment?: string;
  customTag?: string;
}

interface Employee {
  id: string;
  name: string;
  timeRecords?: TimeRecord[];
}

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
    try {
      const parts = record.total.match(/(\d+)h(?:\s*(\d+)m)?/);
      if (parts) {
        const hours = parseInt(parts[1], 10);
        const minutes = parts[2] ? parseInt(parts[2], 10) : 0;
        if (!isNaN(hours) && !isNaN(minutes)) totalMinutes += (hours * 60) + minutes;
      } else {
         const minOnlyParts = record.total.match(/(\d+)m/);
         if(minOnlyParts) {
            const minutes = parseInt(minOnlyParts[1], 10);
            if(!isNaN(minutes)) totalMinutes += minutes;
         } else console.warn("Parse total falhou:", record.total);
      }
    } catch (e) { console.error("Erro parse total:", record.total, e); }
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
  const { user, isAuthenticated } = useAuth();
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Adição Manual (Modal)
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualClient, setManualClient] = useState('MAGNETIC PLACE');
  const [manualTag, setManualTag] = useState('');
  const [manualCustomTag, setManualCustomTag] = useState('');
  const [showManualCustomTag, setShowManualCustomTag] = useState(false);
  const [manualComment, setManualComment] = useState('');

  // Edição Inline
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TimeRecord>>({});

  // Adição Inline
  const [addingInlineDate, setAddingInlineDate] = useState<string | null>(null);
  const [addInlineFormData, setAddInlineFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'total' | 'status'>>>({});

  // Edição em Massa
  const [selectedDays, setSelectedDays] = useState<string[]>([]); // Guarda as datas (DD/MM/YYYY) selecionadas
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditFormData, setBulkEditFormData] = useState<Partial<Omit<TimeRecord, 'id' | 'total' | 'status' | 'date'>>>({ client: 'MAGNETIC PLACE', tag: '' });
  const [bulkEditShowCustomTag, setBulkEditShowCustomTag] = useState(false);

  // Listas
  const clients = ['MAGNETIC PLACE', 'Cliente A', 'Cliente B', 'Cliente C'];
  const tags = ['Desenvolvimento', 'Design', 'Reunião', 'Suporte', 'Administrativo', 'Outro'];

  // --- Carregamento e Persistência ---
  const loadRecordsFromStorage = () => {
    if (!user?.id) return [];
    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        const employees: Employee[] = JSON.parse(storedEmployees);
        const currentUserData = employees.find(emp => emp.id === user.id);
        return (currentUserData?.timeRecords || []).map(rec => ({ ...rec, id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }));
      }
    } catch (error) { console.error('Erro ao carregar:', error); }
    return [];
  };

  const saveRecordsToStorage = (updatedRecords: TimeRecord[]) => {
    if (!user?.id) return;
    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      const employeeIndex = employees.findIndex(emp => emp.id === user.id);
      const recordsWithIds = updatedRecords.map(rec => ({ ...rec, id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }));
      if (employeeIndex === -1) {
        employees.push({ id: user.id, name: user.name || 'Usuário Desconhecido', timeRecords: recordsWithIds });
      } else {
        employees[employeeIndex].timeRecords = recordsWithIds;
      }
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));
      setRecords(sortRecords(recordsWithIds));
    } catch (error) { console.error('Erro ao salvar:', error); alert('Erro ao salvar.'); }
  };

  const sortRecords = (recordsToSort: TimeRecord[]): TimeRecord[] => {
    return [...recordsToSort].sort((a, b) => {
      try {
        const dateA = new Date(`${a.date.split('/').reverse().join('-')}T${a.entry}:00`);
        const dateB = new Date(`${b.date.split('/').reverse().join('-')}T${b.entry}:00`);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) return dateB.getTime() - dateA.getTime();
      } catch (e) { console.error("Erro ao ordenar:", e); }
      return 0;
    });
  };

  useEffect(() => {
    setIsLoading(true);
    const loaded = loadRecordsFromStorage();
    setRecords(sortRecords(loaded));
    setIsLoading(false);
  }, [user?.id]);

  // --- Filtros e Agrupamentos ---
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      try {
        const [day, month, year] = record.date.split('/').map(Number);
        return (month - 1) === selectedMonth && year === selectedYear;
      } catch (e) { console.error('Erro parsear data:', record.date, e); return false; }
    });
  }, [records, selectedMonth, selectedYear]);

  const groupedRecords = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
      if (!acc[record.date]) acc[record.date] = [];
      acc[record.date].push(record);
      acc[record.date].sort((a, b) => a.entry.localeCompare(b.entry));
      return acc;
    }, {} as GroupedRecords);
  }, [filteredRecords]);

  const daysInMonth = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const days: { date: Date, dateString: string }[] = [];
    while (date.getMonth() === selectedMonth) {
      days.push({ date: new Date(date), dateString: date.toLocaleDateString('pt-BR') });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [selectedMonth, selectedYear]);

  // --- Adição Manual (Modal) ---
  const handleManualTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setManualTag(value);
    setShowManualCustomTag(value === 'Outro');
  };
  const resetManualForm = () => {
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualStartTime(''); setManualEndTime(''); setManualClient('MAGNETIC PLACE');
    setManualTag(''); setManualCustomTag(''); setShowManualCustomTag(false); setManualComment('');
    setShowAddModal(false);
  };
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDate || !manualStartTime || !manualEndTime || !manualClient || !manualTag || (manualTag === 'Outro' && !manualCustomTag)) { alert('Preencha campos.'); return; }
    const finalTag = manualTag === 'Outro' ? manualCustomTag : manualTag;
    const start = new Date(`${manualDate}T${manualStartTime}:00`);
    const end = new Date(`${manualDate}T${manualEndTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) { alert('Horas inválidas.'); return; }
    const elapsed = end.getTime() - start.getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 60);
    const formattedDate = new Date(manualDate + 'T00:00:00').toLocaleDateString('pt-BR');
    const newRecord: TimeRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: formattedDate, entry: manualStartTime, exit: manualEndTime,
      total: `${hrs}h ${mins % 60}m`, status: 'Manual',
      client: manualClient, tag: finalTag, comment: manualComment,
    };
    saveRecordsToStorage([...records, newRecord]);
    alert(`Registro adicionado. Tempo: ${hrs}h ${mins % 60}m`);
    resetManualForm();
  };

  // --- Edição Inline ---
  const handleEditClick = (record: TimeRecord) => {
    setEditingRecordId(record.id);
    setEditFormData({ ...record, customTag: record.tag === 'Outro' ? record.customTag || record.tag : '' });
    setAddingInlineDate(null);
    setSelectedDays([]); // Deseleciona dias ao editar inline
  };
  const handleCancelEdit = () => { setEditingRecordId(null); setEditFormData({}); };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveEdit = () => {
    if (!editingRecordId || !editFormData.entry || !editFormData.exit || !editFormData.client || !editFormData.tag) { alert('Dados inválidos.'); return; }
    if (editFormData.tag === 'Outro' && !editFormData.customTag) { alert('Insira etiqueta.'); return; }
    const start = new Date(`2000-01-01T${editFormData.entry}:00`);
    const end = new Date(`2000-01-01T${editFormData.exit}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) { alert('Horas inválidas.'); return; }
    const elapsed = end.getTime() - start.getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 60);
    const finalTag = editFormData.tag === 'Outro' ? editFormData.customTag || '' : editFormData.tag;
    const updatedRecords = records.map(rec => {
      if (rec.id === editingRecordId) {
        return { ...rec, entry: editFormData.entry || rec.entry, exit: editFormData.exit || rec.exit, client: editFormData.client || rec.client, tag: finalTag, comment: editFormData.comment, customTag: editFormData.tag === 'Outro' ? editFormData.customTag : undefined, total: `${hrs}h ${mins % 60}m` };
      }
      return rec;
    });
    saveRecordsToStorage(updatedRecords);
    setEditingRecordId(null); setEditFormData({});
    alert('Registro atualizado!');
  };
  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('Excluir registro?')) {
      saveRecordsToStorage(records.filter(rec => rec.id !== recordId));
      alert('Registro excluído!');
    }
  };

  // --- Adição Inline ---
  const handleStartAddInline = (dateString: string) => {
    setAddingInlineDate(dateString);
    setAddInlineFormData({ date: dateString, client: 'MAGNETIC PLACE', tag: '' });
    setEditingRecordId(null);
    setSelectedDays([]); // Deseleciona dias ao adicionar inline
  };
  const handleCancelAddInline = () => { setAddingInlineDate(null); setAddInlineFormData({}); };
  const handleAddInlineFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddInlineFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveAddInline = () => {
    if (!addingInlineDate || !addInlineFormData.entry || !addInlineFormData.exit || !addInlineFormData.client || !addInlineFormData.tag) { alert('Preencha campos.'); return; }
    if (addInlineFormData.tag === 'Outro' && !addInlineFormData.customTag) { alert('Insira etiqueta.'); return; }
    const start = new Date(`2000-01-01T${addInlineFormData.entry}:00`);
    const end = new Date(`2000-01-01T${addInlineFormData.exit}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) { alert('Horas inválidas.'); return; }
    const elapsed = end.getTime() - start.getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 60);
    const finalTag = addInlineFormData.tag === 'Outro' ? addInlineFormData.customTag || '' : addInlineFormData.tag;
    const newRecord: TimeRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: addingInlineDate, entry: addInlineFormData.entry, exit: addInlineFormData.exit,
      total: `${hrs}h ${mins % 60}m`, status: 'Manual',
      client: addInlineFormData.client, tag: finalTag, comment: addInlineFormData.comment,
      customTag: addInlineFormData.tag === 'Outro' ? addInlineFormData.customTag : undefined,
    };
    saveRecordsToStorage([...records, newRecord]);
    setAddingInlineDate(null); setAddInlineFormData({});
    alert('Novo registro adicionado!');
  };

  // --- Edição em Massa ---
  const handleDaySelectionChange = (dateString: string, isSelected: boolean) => {
    setSelectedDays(prev => isSelected ? [...prev, dateString] : prev.filter(d => d !== dateString));
    setEditingRecordId(null); // Cancela edições inline ao selecionar/deselecionar dias
    setAddingInlineDate(null);
  };

  const handleOpenBulkEditModal = () => {
    if (selectedDays.length === 0) return;
    setBulkEditFormData({ client: 'MAGNETIC PLACE', tag: '' }); // Reset form
    setBulkEditShowCustomTag(false);
    setShowBulkEditModal(true);
  };

  const handleBulkEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBulkEditFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'tag') setBulkEditShowCustomTag(value === 'Outro');
  };

  const resetBulkEditForm = () => {
    setShowBulkEditModal(false);
    setBulkEditFormData({ client: 'MAGNETIC PLACE', tag: '' });
    setBulkEditShowCustomTag(false);
    setSelectedDays([]); // Limpa seleção após salvar/cancelar
  };

  const handleBulkEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkEditFormData.entry || !bulkEditFormData.exit || !bulkEditFormData.client || !bulkEditFormData.tag || (bulkEditFormData.tag === 'Outro' && !bulkEditFormData.customTag)) {
      alert('Preencha os campos obrigatórios para edição em massa.'); return;
    }
    const start = new Date(`2000-01-01T${bulkEditFormData.entry}:00`);
    const end = new Date(`2000-01-01T${bulkEditFormData.exit}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      alert('Horas inválidas para edição em massa.'); return;
    }
    const elapsed = end.getTime() - start.getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 60);
    const finalTag = bulkEditFormData.tag === 'Outro' ? bulkEditFormData.customTag || '' : bulkEditFormData.tag;

    const newRecordsToAdd: TimeRecord[] = selectedDays.map(dateString => ({
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: dateString,
      entry: bulkEditFormData.entry || '',
      exit: bulkEditFormData.exit || '',
      total: `${hrs}h ${mins % 60}m`,
      status: 'Manual (Massa)',
      client: bulkEditFormData.client || '',
      tag: finalTag,
      comment: bulkEditFormData.comment,
      customTag: bulkEditFormData.tag === 'Outro' ? bulkEditFormData.customTag : undefined,
    }));

    saveRecordsToStorage([...records, ...newRecordsToAdd]);
    alert(`${newRecordsToAdd.length} registro(s) adicionado(s) em massa.`);
    resetBulkEditForm();
  };

  // --- Navegação Mês/Ano ---
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => prev === 0 ? 11 : prev - 1);
    setSelectedYear(prev => selectedMonth === 0 ? prev - 1 : prev);
    setSelectedDays([]); // Limpa seleção ao mudar de mês
  };
  const goToNextMonth = () => {
    setSelectedMonth(prev => prev === 11 ? 0 : prev + 1);
    setSelectedYear(prev => selectedMonth === 11 ? prev + 1 : prev);
    setSelectedDays([]); // Limpa seleção ao mudar de mês
  };
  const currentMonthYearName = useMemo(() => {
    return new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [selectedMonth, selectedYear]);

  // --- Renderização ---
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><p>Deve iniciar sessão.</p></div>;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Folha de Ponto</h1>

      {/* Controles Superiores */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <button onClick={goToPreviousMonth} className="p-2 rounded hover:bg-gray-200 text-gray-600">&lt;</button>
          <span className="text-lg font-semibold w-36 text-center capitalize">{currentMonthYearName}</span>
          <button onClick={goToNextMonth} className="p-2 rounded hover:bg-gray-200 text-gray-600">&gt;</button>
        </div>
        <div className="flex items-center space-x-3">
          {selectedDays.length > 0 && (
            <button onClick={handleOpenBulkEditModal} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
              Editar {selectedDays.length} Dias
            </button>
          )}
          <button onClick={() => setShowAddModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            + Adicionar (Modal)
          </button>
        </div>
      </div>

      {/* Lista de Dias */}
      <div className="space-y-6">
        {daysInMonth.map(({ date, dateString }) => {
          const dailyTotalString = calculateDailyTotal(groupedRecords[dateString]);
          const isSelected = selectedDays.includes(dateString);
          return (
            <div key={dateString} className={`bg-white p-4 rounded-lg shadow ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2 flex justify-between items-center">
                <label className="flex items-center flex-grow capitalize cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleDaySelectionChange(dateString, e.target.checked)}
                    className="mr-3 h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}
                </label>
                {dailyTotalString && (
                  <span className="text-sm font-normal text-gray-500 ml-2 whitespace-nowrap">{dailyTotalString}</span>
                )}
              </h2>

              {/* Registros Existentes */}
              <ul className="space-y-3 mb-3">
                {(groupedRecords[dateString] || []).map((record) => (
                  <li key={record.id} className="p-3 bg-gray-50 rounded">
                    {editingRecordId === record.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-xs font-medium text-gray-600">Início</label><input type="time" name="entry" value={editFormData.entry || ''} onChange={handleEditFormChange} className="input-edit" /></div>
                          <div><label className="text-xs font-medium text-gray-600">Fim</label><input type="time" name="exit" value={editFormData.exit || ''} onChange={handleEditFormChange} className="input-edit" /></div>
                        </div>
                        <div><label className="text-xs font-medium text-gray-600">Cliente</label><select name="client" value={editFormData.client || ''} onChange={handleEditFormChange} className="input-edit bg-white"><option value="">Selecione</option>{clients.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className="text-xs font-medium text-gray-600">Etiqueta</label><select name="tag" value={editFormData.tag || ''} onChange={handleEditFormChange} className="input-edit bg-white"><option value="">Selecione</option>{tags.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        {editFormData.tag === 'Outro' && ( <div><label className="text-xs font-medium text-gray-600">Etiqueta Personalizada</label><input type="text" name="customTag" value={editFormData.customTag || ''} onChange={handleEditFormChange} required className="input-edit" /></div> )}
                        <div><label className="text-xs font-medium text-gray-600">Comentário</label><textarea name="comment" value={editFormData.comment || ''} onChange={handleEditFormChange} rows={2} className="input-edit"></textarea></div>
                        <div className="flex justify-end space-x-2 mt-2">
                          <button onClick={handleCancelEdit} className="p-1 text-gray-500 hover:text-gray-700"><CancelIcon /></button>
                          <button onClick={handleSaveEdit} className="p-1 text-green-500 hover:text-green-700"><SaveIcon /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-1 mb-2 md:mb-0 md:mr-4">
                          <span className="font-mono text-sm md:text-base">{record.entry} - {record.exit}</span>
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{record.total}</span>
                          <p className="text-sm text-gray-600 mt-1">{record.client} - {record.tag}{record.status !== 'Cronômetro' && <span className="ml-2 text-green-600 text-xs">({record.status})</span>}</p>
                          {record.comment && <p className="text-xs text-gray-500 mt-1 italic">{record.comment}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditClick(record)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon /></button>
                          <button onClick={() => handleDeleteRecord(record.id)} className="p-1 text-gray-500 hover:text-red-600"><DeleteIcon /></button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                {(!groupedRecords[dateString] || groupedRecords[dateString].length === 0) && addingInlineDate !== dateString && ( <p className="text-sm text-gray-500 italic">Nenhum registro.</p> )}
              </ul>

              {/* Formulário Adição Inline */}
              {addingInlineDate === dateString && (
                <div className="p-3 bg-green-50 rounded border border-green-200 space-y-3">
                   <h3 className="text-sm font-semibold text-green-800">Adicionar Novo</h3>
                   <div className="grid grid-cols-2 gap-3">
                     <div><label className="text-xs font-medium text-gray-600">Início</label><input type="time" name="entry" value={addInlineFormData.entry || ''} onChange={handleAddInlineFormChange} className="input-edit" /></div>
                     <div><label className="text-xs font-medium text-gray-600">Fim</label><input type="time" name="exit" value={addInlineFormData.exit || ''} onChange={handleAddInlineFormChange} className="input-edit" /></div>
                   </div>
                   <div><label className="text-xs font-medium text-gray-600">Cliente</label><select name="client" value={addInlineFormData.client || ''} onChange={handleAddInlineFormChange} className="input-edit bg-white"><option value="">Selecione</option>{clients.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                   <div><label className="text-xs font-medium text-gray-600">Etiqueta</label><select name="tag" value={addInlineFormData.tag || ''} onChange={handleAddInlineFormChange} className="input-edit bg-white"><option value="">Selecione</option>{tags.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                   {addInlineFormData.tag === 'Outro' && ( <div><label className="text-xs font-medium text-gray-600">Etiqueta Personalizada</label><input type="text" name="customTag" value={addInlineFormData.customTag || ''} onChange={handleAddInlineFormChange} required className="input-edit" /></div> )}
                   <div><label className="text-xs font-medium text-gray-600">Comentário</label><textarea name="comment" value={addInlineFormData.comment || ''} onChange={handleAddInlineFormChange} rows={2} className="input-edit"></textarea></div>
                   <div className="flex justify-end space-x-2 mt-2">
                     <button onClick={handleCancelAddInline} className="p-1 text-gray-500 hover:text-gray-700"><CancelIcon /></button>
                     <button onClick={handleSaveAddInline} className="p-1 text-green-500 hover:text-green-700"><SaveIcon /></button>
                   </div>
                </div>
              )}

              {/* Botão Adicionar Inline */}
              {addingInlineDate !== dateString && (
                <button onClick={() => handleStartAddInline(dateString)} className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <AddIcon /> Adicionar Tramo
                </button>
              )}
            </div>
          )}
        )}
      </div>

      {/* Modal Adição Manual */}
      {showAddModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
             <h2 className="text-xl font-bold mb-4">Adicionar Registro Manual (Modal)</h2>
             <form onSubmit={handleManualSubmit} className="space-y-4">
                <div><label htmlFor="manualDate">Data</label><input type="date" id="manualDate" value={manualDate} onChange={e => setManualDate(e.target.value)} required className="input-edit" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="manualStartTime">Hora Início</label><input type="time" id="manualStartTime" value={manualStartTime} onChange={e => setManualStartTime(e.target.value)} required className="input-edit" /></div>
                  <div><label htmlFor="manualEndTime">Hora Fim</label><input type="time" id="manualEndTime" value={manualEndTime} onChange={e => setManualEndTime(e.target.value)} required className="input-edit" /></div>
                </div>
                <div><label htmlFor="manualClient">Cliente</label><select id="manualClient" value={manualClient} onChange={e => setManualClient(e.target.value)} required className="input-edit bg-white">{clients.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label htmlFor="manualTag">Etiqueta</label><select id="manualTag" value={manualTag} onChange={handleManualTagChange} required className="input-edit bg-white"><option value="">Selecione</option>{tags.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                {showManualCustomTag && ( <div><label htmlFor="manualCustomTag">Etiqueta Personalizada</label><input type="text" id="manualCustomTag" value={manualCustomTag} onChange={e => setManualCustomTag(e.target.value)} required={manualTag === 'Outro'} className="input-edit" /></div>)}
                <div><label htmlFor="manualComment">Comentário</label><textarea id="manualComment" value={manualComment} onChange={e => setManualComment(e.target.value)} rows={2} className="input-edit"></textarea></div>
               <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={resetManualForm} className="btn-secondary">Cancelar</button>
                 <button type="submit" className="btn-primary bg-green-500 hover:bg-green-600">Salvar Registro</button>
               </div>
             </form>
           </div>
         </div>
       )}

      {/* Modal Edição em Massa */}
      {showBulkEditModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
             <h2 className="text-xl font-bold mb-4">Adicionar Horário a {selectedDays.length} Dias Selecionados</h2>
             <form onSubmit={handleBulkEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="bulkEntry">Hora Início</label><input type="time" id="bulkEntry" name="entry" value={bulkEditFormData.entry || ''} onChange={handleBulkEditFormChange} required className="input-edit" /></div>
                  <div><label htmlFor="bulkExit">Hora Fim</label><input type="time" id="bulkExit" name="exit" value={bulkEditFormData.exit || ''} onChange={handleBulkEditFormChange} required className="input-edit" /></div>
                </div>
                <div><label htmlFor="bulkClient">Cliente</label><select id="bulkClient" name="client" value={bulkEditFormData.client || ''} onChange={handleBulkEditFormChange} required className="input-edit bg-white">{clients.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label htmlFor="bulkTag">Etiqueta</label><select id="bulkTag" name="tag" value={bulkEditFormData.tag || ''} onChange={handleBulkEditFormChange} required className="input-edit bg-white"><option value="">Selecione</option>{tags.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                {bulkEditShowCustomTag && ( <div><label htmlFor="bulkCustomTag">Etiqueta Personalizada</label><input type="text" id="bulkCustomTag" name="customTag" value={bulkEditFormData.customTag || ''} onChange={handleBulkEditFormChange} required={bulkEditFormData.tag === 'Outro'} className="input-edit" /></div>)}
                <div><label htmlFor="bulkComment">Comentário</label><textarea id="bulkComment" name="comment" value={bulkEditFormData.comment || ''} onChange={handleBulkEditFormChange} rows={2} className="input-edit"></textarea></div>
               <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={resetBulkEditForm} className="btn-secondary">Cancelar</button>
                 <button type="submit" className="btn-primary bg-yellow-500 hover:bg-yellow-600">Adicionar em Massa</button>
               </div>
             </form>
           </div>
         </div>
      )}

      {/* Estilos Globais */}
      <style jsx global>{`
        .input-edit { margin-top: 0.25rem; display: block; width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        textarea.input-edit { padding: 0.5rem; }
        .btn-primary { background-color: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 600; transition: background-color 0.2s; }
        .btn-primary:hover { background-color: #2563eb; }
        .btn-secondary { background-color: #e5e7eb; color: #1f2937; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 600; transition: background-color 0.2s; }
        .btn-secondary:hover { background-color: #d1d5db; }
      `}</style>
    </div>
  );
}

