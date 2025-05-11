
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../lib/auth';
import type { TimeRecord as ModelTimeRecord, Employee as ModelEmployee, Client as ModelClient } from '../../lib/time-tracking-models';

// Tipos
interface TimeRecord extends ModelTimeRecord {}
interface Employee extends ModelEmployee {}
interface Client extends ModelClient {}

interface CurrentTimeRecordData {
    userId?: string;
    userName?: string;
    clientId: string;
    tag: string;
    startTime: string; // ISO string
    date: string; // DD/MM/YYYY
}

export default function CronometroPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentUserData, setCurrentUserData] = useState<Employee | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [timer, setTimer] = useState('00:00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [startTimeForCalc, setStartTimeForCalc] = useState<number | null>(null); // Usado para cálculo do tempo decorrido
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [availableClientsForTimer, setAvailableClientsForTimer] = useState<Client[]>([]);

  // Estado para cronômetro automático
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);

  // Estado para registro manual
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualClientId, setManualClientIdState] = useState(''); // Renomeado para evitar conflito
  const [manualTag, setManualTag] = useState('');
  const [manualCustomTag, setManualCustomTag] = useState('');
  const [showManualCustomTag, setShowManualCustomTag] = useState(false);

  const tags = ['Desenvolvimento', 'Design', 'Reunião', 'Suporte', 'Administrativo', 'Outro'];

  // Carregar dados iniciais (clientes, dados do usuário, registro em andamento)
  useEffect(() => {
    if (authLoading) return;

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
            // Determinar clientes disponíveis
            let userSpecificClients = activeClients;
            if (user.role !== 'admin' && foundUser.assignedClientIds && foundUser.assignedClientIds.length > 0) {
              userSpecificClients = activeClients.filter(client => foundUser.assignedClientIds?.includes(client.id));
            }
            setAvailableClientsForTimer(userSpecificClients);

            const defaultClientForUser = foundUser.defaultClientId || (userSpecificClients.length > 0 ? userSpecificClients[0].id : '');
            setSelectedClientId(defaultClientForUser);
            setManualClientIdState(defaultClientForUser);
          } else {
             setAvailableClientsForTimer(activeClients); // Usuário não encontrado na lista de funcionários, mostra todos ativos
             if (activeClients.length > 0) {
                setSelectedClientId(activeClients[0].id);
                setManualClientIdState(activeClients[0].id);
             }
          }
        }
      } else {
        // Usuário não logado ou sem ID, mostrar todos os clientes ativos
        setAvailableClientsForTimer(activeClients);
        if (activeClients.length > 0) {
            setSelectedClientId(activeClients[0].id);
            setManualClientIdState(activeClients[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais do cronômetro:', error);
    }

    // Verificar registro em andamento
    const savedRecordJson = localStorage.getItem('currentTimeRecord');
    if (savedRecordJson) {
      try {
        const record: CurrentTimeRecordData = JSON.parse(savedRecordJson);
        if (record.userId === user?.id) { // Garante que o registro é do usuário atual
            const savedStartTimeEpoch = new Date(record.startTime).getTime();
            const nowEpoch = Date.now();
            const currentElapsedTime = nowEpoch - savedStartTimeEpoch;
            
            setSelectedClientId(record.clientId);
            if (record.tag) {
                if (tags.includes(record.tag)) {
                    setSelectedTag(record.tag);
                    setShowCustomTag(false);
                } else {
                    setSelectedTag('Outro');
                    setCustomTag(record.tag);
                    setShowCustomTag(true);
                }
            }
            setStartTimeForCalc(nowEpoch); // Inicia a base de cálculo do tempo a partir de agora
            setElapsedTime(currentElapsedTime); // Define o tempo já decorrido
            setIsRunning(true);
        }
      } catch (error) {
        console.error('Erro ao carregar registro em andamento:', error);
        localStorage.removeItem('currentTimeRecord');
      }
    }
  }, [user, authLoading]);

  // Atualizar hora e data atual (display)
  useEffect(() => {
    const updateDateTimeDisplay = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR'));
      setCurrentDate(`Hoje é ${now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    };
    updateDateTimeDisplay();
    const interval = setInterval(updateDateTimeDisplay, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lógica do cronômetro em execução
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning && startTimeForCalc) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const newElapsedTime = elapsedTime + (now - (startTimeForCalc || now)); // Adiciona o tempo desde a última atualização
        setStartTimeForCalc(now); // Atualiza o ponto de início para o próximo intervalo
        setElapsedTime(newElapsedTime);
        
        const totalSeconds = Math.floor(newElapsedTime / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secondsDisplay = String(totalSeconds % 60).padStart(2, '0');
        setTimer(`${hours}:${minutes}:${secondsDisplay}`);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, startTimeForCalc, elapsedTime]);

  const toggleTimer = () => {
    if (!user?.id) {
        alert("Usuário não identificado. Não é possível iniciar o cronômetro.");
        return;
    }
    if (!isRunning) {
      if (!selectedClientId) { alert('Por favor, selecione um cliente.'); return; }
      if (!selectedTag) { alert('Por favor, selecione uma etiqueta.'); return; }
      if (selectedTag === 'Outro' && !customTag) { alert('Por favor, insira uma etiqueta personalizada.'); return; }
      
      const finalTag = selectedTag === 'Outro' ? customTag : selectedTag;
      const recordStartTime = new Date(); // Momento exato do início

      setStartTimeForCalc(recordStartTime.getTime());
      setElapsedTime(0); // Reseta o tempo decorrido
      setIsRunning(true);
      setTimer('00:00:00');

      const startRecordData: CurrentTimeRecordData = {
        userId: user.id,
        userName: user.name,
        clientId: selectedClientId,
        tag: finalTag,
        startTime: recordStartTime.toISOString(),
        date: recordStartTime.toLocaleDateString('pt-BR')
      };
      localStorage.setItem('currentTimeRecord', JSON.stringify(startRecordData));
      console.log('Cronômetro iniciado:', startRecordData);
    } else {
      setIsRunning(false);
      const savedRecordJson = localStorage.getItem('currentTimeRecord');
      if (!savedRecordJson) {
        console.error('Registro de início não encontrado ao parar o cronômetro.');
        return;
      }
      const startRecord: CurrentTimeRecordData = JSON.parse(savedRecordJson);
      const endTime = new Date();
      const finalElapsedTime = elapsedTime; // elapsedTime já tem o total em ms

      const totalMinutes = Math.floor(finalElapsedTime / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const newTimeRecord: Partial<TimeRecord> = {
        id: `rec-${Date.now()}`,
        userId: startRecord.userId!,
        date: startRecord.date,
        startTime: new Date(startRecord.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        totalWorkTime: totalMinutes,
        status: 'Completo (Cron.)',
        clientId: startRecord.clientId,
        clientTag: startRecord.tag, // Mantendo clientTag para compatibilidade com folha de ponto
        usedEntryTolerance: false, // Adicionar lógica se necessário
        usedExitTolerance: false   // Adicionar lógica se necessário
      };
      saveTimeRecordForEmployee(startRecord.userId!, newTimeRecord as TimeRecord);
      localStorage.removeItem('currentTimeRecord');
      setTimer('00:00:00');
      setElapsedTime(0);
      setStartTimeForCalc(null);
      alert(`Jornada finalizada. Tempo trabalhado: ${hours}h ${minutes}m`);
    }
  };

  const saveTimeRecordForEmployee = (employeeId: string, timeRecord: TimeRecord) => {
    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      const employeeIndex = employees.findIndex(emp => emp.id === employeeId);

      if (employeeIndex !== -1) {
        if (!employees[employeeIndex].timeRecords) {
          employees[employeeIndex].timeRecords = [];
        }
        employees[employeeIndex].timeRecords!.push(timeRecord);
        localStorage.setItem('timetracker_employees', JSON.stringify(employees));
        console.log('Registro de tempo salvo para o funcionário:', employeeId);
      } else {
        console.error('Funcionário não encontrado para salvar registro de tempo.');
      }
    } catch (error) {
      console.error('Erro ao salvar registro de tempo:', error);
    }
  };

  const handleTagChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTag(value);
    setShowCustomTag(value === 'Outro');
    if (value !== 'Outro') setCustomTag('');
  };

  const handleManualTagChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setManualTag(value);
    setShowManualCustomTag(value === 'Outro');
    if (value !== 'Outro') setManualCustomTag('');
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) { alert("Usuário não logado."); return; }
    if (!manualDate || !manualStartTime || !manualEndTime || !manualClientId || !manualTag) {
      alert('Preencha todos os campos obrigatórios (Data, Início, Fim, Cliente, Etiqueta).'); return;
    }
    if (manualTag === 'Outro' && !manualCustomTag) {
      alert('Insira uma etiqueta personalizada.'); return;
    }

    const startDateTime = new Date(`${manualDate}T${manualStartTime}:00`);
    const endDateTime = new Date(`${manualDate}T${manualEndTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || endDateTime <= startDateTime) {
      alert('Horas de início e fim inválidas.'); return;
    }

    const manualTotalMinutes = (endDateTime.getTime() - startDateTime.getTime()) / 60000;
    const hours = Math.floor(manualTotalMinutes / 60);
    const minutes = manualTotalMinutes % 60;
    const formattedDate = new Date(manualDate + 'T00:00:00').toLocaleDateString('pt-BR');

    const newTimeRecord: Partial<TimeRecord> = {
      id: `rec-manual-${Date.now()}`,
      userId: user.id,
      date: formattedDate,
      startTime: manualStartTime,
      endTime: manualEndTime,
      totalWorkTime: manualTotalMinutes,
      status: 'Manual',
      clientId: manualClientId,
      clientTag: manualTag === 'Outro' ? manualCustomTag : manualTag,
      usedEntryTolerance: false,
      usedExitTolerance: false
    };
    saveTimeRecordForEmployee(user.id, newTimeRecord as TimeRecord);
    alert(`Registro manual adicionado. Tempo: ${hours}h ${minutes}m`);
    // Resetar formulário manual
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualStartTime('');
    setManualEndTime('');
    // Manter cliente padrão ou o último selecionado pode ser útil
    // setManualClientIdState(currentUserData?.defaultClientId || (availableClientsForTimer.length > 0 ? availableClientsForTimer[0].id : ''));
    setManualTag('');
    setManualCustomTag('');
    setShowManualCustomTag(false);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando autenticação...</p></div>;
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Deve iniciar sessão para aceder a esta página</p>
          <a href="/auth/login" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Iniciar sessão
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 font-sans">
      {/* Seção do Cronômetro Automático */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Cronômetro</h1>
            <p className="text-sm text-gray-600">Bem-vindo, <span className="font-semibold">{user?.name || 'Usuário'}</span>!</p>
          </div>
          <div className="text-right mt-2 sm:mt-0">
            <p className="text-lg font-semibold text-gray-700">{currentTime}</p>
            <p className="text-xs text-gray-500">{currentDate}</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className={`text-5xl sm:text-7xl font-mono font-bold mb-2 ${isRunning ? 'text-green-600' : 'text-gray-800'}`}>{timer}</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            <span className={`w-2.5 h-2.5 mr-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            {isRunning ? 'EM ANDAMENTO' : 'PARADO'}
          </div>
        </div>

        {!isRunning && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="selectedClientId" className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select
                  id="selectedClientId"
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={isRunning}
                >
                  <option value="">Selecione um cliente</option>
                  {availableClientsForTimer.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="selectedTag" className="block text-sm font-medium text-gray-700 mb-1">Etiqueta (Projeto/Tarefa) *</label>
                <select
                  id="selectedTag"
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={selectedTag}
                  onChange={handleTagChange}
                  disabled={isRunning}
                >
                  <option value="">Selecione uma etiqueta</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
            {showCustomTag && (
              <div>
                <label htmlFor="customTag" className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Personalizada *</label>
                <input
                  id="customTag"
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Insira a etiqueta específica"
                  disabled={isRunning}
                  required={selectedTag === 'Outro'}
                />
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTimer}
          disabled={!isRunning && (!selectedClientId || !selectedTag || (selectedTag === 'Outro' && !customTag))}
          className={`w-full flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-semibold text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-4 ${ 
            isRunning 
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300' 
              : (!selectedClientId || !selectedTag || (selectedTag === 'Outro' && !customTag)) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            {isRunning ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            )}
          </svg>
          {isRunning ? 'PARAR CRONÔMETRO' : 'INICIAR CRONÔMETRO'}
        </button>
      </div>

      {/* Seção de Registro Manual */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">Registro Manual de Horas</h2>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="manualDate" className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                id="manualDate"
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                required
              />
            </div>
            <div>
                <label htmlFor="manualClientIdState" className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select
                  id="manualClientIdState"
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={manualClientId}
                  onChange={(e) => setManualClientIdState(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {availableClientsForTimer.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="manualStartTime" className="block text-sm font-medium text-gray-700 mb-1">Hora de Início *</label>
              <input
                id="manualStartTime"
                type="time"
                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={manualStartTime}
                onChange={(e) => setManualStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="manualEndTime" className="block text-sm font-medium text-gray-700 mb-1">Hora de Fim *</label>
              <input
                id="manualEndTime"
                type="time"
                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={manualEndTime}
                onChange={(e) => setManualEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="manualTag" className="block text-sm font-medium text-gray-700 mb-1">Etiqueta (Projeto/Tarefa) *</label>
            <select
              id="manualTag"
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={manualTag}
              onChange={handleManualTagChange}
              required
            >
              <option value="">Selecionar etiqueta</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          {showManualCustomTag && (
            <div>
              <label htmlFor="manualCustomTag" className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Personalizada *</label>
              <input
                id="manualCustomTag"
                type="text"
                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={manualCustomTag}
                onChange={(e) => setManualCustomTag(e.target.value)}
                placeholder="Insira a etiqueta específica"
                required={manualTag === 'Outro'}
              />
            </div>
          )}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-colors duration-150 ease-in-out"
            >
              Adicionar Registro Manual
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

