
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../lib/auth';
import type { TimeRecord as ModelTimeRecord, Employee as ModelEmployee, Client as ModelClient, Funcao as ModelFuncao } from '../../lib/time-tracking-models';

// Tipos
interface TimeRecord extends ModelTimeRecord {}
interface Employee extends ModelEmployee {}
interface Client extends ModelClient {}
interface Funcao extends ModelFuncao {}

interface CurrentTimeRecordData {
    userId?: string;
    userName?: string;
    clientId: string;
    funcaoId: string; // Alterado de tag para funcaoId
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
  const [startTimeForCalc, setStartTimeForCalc] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [availableClientsForTimer, setAvailableClientsForTimer] = useState<Client[]>([]);
  const [allFuncoes, setAllFuncoes] = useState<Funcao[]>([]);
  const [availableFuncoesForTimer, setAvailableFuncoesForTimer] = useState<Funcao[]>([]);

  // Estado para cronômetro automático
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedFuncaoId, setSelectedFuncaoId] = useState(''); // Alterado de selectedTag
  const [customFuncaoInput, setCustomFuncaoInput] = useState(''); // Alterado de customTag
  const [showCustomFuncaoInput, setShowCustomFuncaoInput] = useState(false); // Alterado de showCustomTag

  // Estado para registro manual
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualClientId, setManualClientIdState] = useState('');
  const [manualFuncaoId, setManualFuncaoId] = useState(''); // Alterado de manualTag
  const [manualCustomFuncaoInput, setManualCustomFuncaoInput] = useState(''); // Alterado de manualCustomTag
  const [showManualCustomFuncaoInput, setShowManualCustomFuncaoInput] = useState(false); // Alterado de showManualCustomTag

  // Carregar dados iniciais (clientes, funções, dados do usuário, registro em andamento)
  useEffect(() => {
    if (authLoading) return;

    try {
      const storedClients = localStorage.getItem('timetracker_clients');
      const activeClients = storedClients ? (JSON.parse(storedClients) as Client[]).filter(c => c.status === 'active') : [];
      setAllClients(activeClients);

      const storedFuncoes = localStorage.getItem('timetracker_funcoes'); // Assumindo que funções serão armazenadas aqui
      const activeFuncoes = storedFuncoes ? (JSON.parse(storedFuncoes) as Funcao[]).filter(f => f.status === 'active') : [];
      setAllFuncoes(activeFuncoes);

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

            // Determinar funções disponíveis
            let userSpecificFuncoes = activeFuncoes;
            if (user.role !== 'admin' && foundUser.assignedFuncaoIds && foundUser.assignedFuncaoIds.length > 0) {
              userSpecificFuncoes = activeFuncoes.filter(funcao => foundUser.assignedFuncaoIds?.includes(funcao.id));
            }
            setAvailableFuncoesForTimer(userSpecificFuncoes);
            const defaultFuncaoForUser = foundUser.defaultFuncaoId || (userSpecificFuncoes.length > 0 ? userSpecificFuncoes[0].id : '');
            setSelectedFuncaoId(defaultFuncaoForUser);
            setManualFuncaoId(defaultFuncaoForUser);

          } else {
             setAvailableClientsForTimer(activeClients);
             if (activeClients.length > 0) {
                setSelectedClientId(activeClients[0].id);
                setManualClientIdState(activeClients[0].id);
             }
             setAvailableFuncoesForTimer(activeFuncoes);
             if (activeFuncoes.length > 0) {
                setSelectedFuncaoId(activeFuncoes[0].id);
                setManualFuncaoId(activeFuncoes[0].id);
             }
          }
        }
      } else {
        setAvailableClientsForTimer(activeClients);
        if (activeClients.length > 0) {
            setSelectedClientId(activeClients[0].id);
            setManualClientIdState(activeClients[0].id);
        }
        setAvailableFuncoesForTimer(activeFuncoes);
        if (activeFuncoes.length > 0) {
            setSelectedFuncaoId(activeFuncoes[0].id);
            setManualFuncaoId(activeFuncoes[0].id);
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
        if (record.userId === user?.id) {
            const savedStartTimeEpoch = new Date(record.startTime).getTime();
            const nowEpoch = Date.now();
            const currentElapsedTime = nowEpoch - savedStartTimeEpoch;
            
            setSelectedClientId(record.clientId);
            // Lógica para função (anteriormente tag)
            const funcaoDoRegistro = allFuncoes.find(f => f.id === record.funcaoId);
            if (funcaoDoRegistro) {
                setSelectedFuncaoId(record.funcaoId);
                setShowCustomFuncaoInput(funcaoDoRegistro.name.toLowerCase() === 'outra'); // Assumindo que 'Outra' é um nome de função
                if (funcaoDoRegistro.name.toLowerCase() === 'outra') {
                    // Se a função é 'Outra', o valor específico pode estar no comentário do registro de tempo, ou precisaria ser salvo separadamente
                    // Por agora, vamos assumir que se for 'Outra', o usuário precisará preencher de novo ou que o campo de comentário do TimeRecord guardará isso.
                    // Para simplificar, não vamos tentar recuperar o customFuncaoInput aqui, a menos que seja explicitamente salvo no currentTimeRecord.
                }
            } else if (record.funcaoId) { // Se o ID existe mas a função não foi encontrada (ex: inativa), pode ser um texto antigo
                 // Tentar tratar como um texto customizado se a estrutura antiga de 'tag' como string ainda existir
                 // Esta parte pode precisar de ajuste dependendo de como 'customTag' era salvo antes
                 const isOldTagStyle = !allFuncoes.some(f => f.id === record.funcaoId) && typeof record.funcaoId === 'string';
                 if(isOldTagStyle){
                    const outraFuncao = allFuncoes.find(f => f.name.toLowerCase() === 'outra');
                    if(outraFuncao) setSelectedFuncaoId(outraFuncao.id);
                    setCustomFuncaoInput(record.funcaoId); // Assume que o ID antigo era o texto da tag customizada
                    setShowCustomFuncaoInput(true);
                 }
            }

            setStartTimeForCalc(nowEpoch);
            setElapsedTime(currentElapsedTime);
            setIsRunning(true);
        }
      } catch (error) {
        console.error('Erro ao carregar registro em andamento:', error);
        localStorage.removeItem('currentTimeRecord');
      }
    }
  }, [user, authLoading, allFuncoes]); // Adicionado allFuncoes às dependências

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
        const newElapsedTime = elapsedTime + (now - (startTimeForCalc || now));
        setStartTimeForCalc(now);
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
      if (!selectedFuncaoId) { alert('Por favor, selecione uma função.'); return; }
      
      const funcaoSelecionada = allFuncoes.find(f => f.id === selectedFuncaoId);
      if (funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' && !customFuncaoInput) {
        alert('Por favor, especifique a função personalizada.'); return;
      }
      
      const finalFuncaoId = selectedFuncaoId;
      // O comentário pode ser usado para o customFuncaoInput se a função for 'Outra'
      const commentForRecord = funcaoSelecionada && funcaoSelecionada.name.toLowerCase() === 'outra' ? customFuncaoInput : '';

      const recordStartTime = new Date();

      setStartTimeForCalc(recordStartTime.getTime());
      setElapsedTime(0);
      setIsRunning(true);
      setTimer('00:00:00');

      const startRecordData: CurrentTimeRecordData = {
        userId: user.id,
        userName: user.name,
        clientId: selectedClientId,
        funcaoId: finalFuncaoId,
        startTime: recordStartTime.toISOString(),
        date: recordStartTime.toLocaleDateString('pt-BR')
      };
      // Se a função for 'Outra', podemos querer salvar o customFuncaoInput em algum lugar no startRecordData
      // Por exemplo, adicionando um campo `customFuncaoDetail` ou usando o `comment` se a estrutura permitir.
      // Para manter CurrentTimeRecordData simples, o comentário será adicionado ao TimeRecord final.

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
      const finalElapsedTime = elapsedTime;

      const totalMinutes = Math.floor(finalElapsedTime / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const funcaoDoRegistroParado = allFuncoes.find(f => f.id === startRecord.funcaoId);
      const commentForStoppedRecord = funcaoDoRegistroParado && funcaoDoRegistroParado.name.toLowerCase() === 'outra' ? customFuncaoInput : '';

      const newTimeRecord: Partial<TimeRecord> = {
        id: `rec-${Date.now()}`,
        userId: startRecord.userId!,
        date: startRecord.date,
        startTime: new Date(startRecord.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        totalWorkTime: totalMinutes,
        status: 'Completo (Cron.)',
        clientId: startRecord.clientId,
        funcaoId: startRecord.funcaoId,
        comment: commentForStoppedRecord, // Salva o input customizado se a função for 'Outra'
        usedEntryTolerance: false,
        usedExitTolerance: false
      };
      saveTimeRecordForEmployee(startRecord.userId!, newTimeRecord as TimeRecord);
      localStorage.removeItem('currentTimeRecord');
      setTimer('00:00:00');
      setElapsedTime(0);
      setStartTimeForCalc(null);
      // Resetar customFuncaoInput após parar
      if (funcaoDoRegistroParado && funcaoDoRegistroParado.name.toLowerCase() === 'outra') {
        setCustomFuncaoInput('');
      }
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

  const handleFuncaoChange = (e: ChangeEvent<HTMLSelectElement>) => { // Alterado de handleTagChange
    const value = e.target.value;
    setSelectedFuncaoId(value);
    const funcaoSelecionada = allFuncoes.find(f => f.id === value);
    setShowCustomFuncaoInput(funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false);
    if (!funcaoSelecionada || funcaoSelecionada.name.toLowerCase() !== 'outra') {
      setCustomFuncaoInput('');
    }
  };

  const handleManualFuncaoChange = (e: ChangeEvent<HTMLSelectElement>) => { // Alterado de handleManualTagChange
    const value = e.target.value;
    setManualFuncaoId(value);
    const funcaoSelecionada = allFuncoes.find(f => f.id === value);
    setShowManualCustomFuncaoInput(funcaoSelecionada ? funcaoSelecionada.name.toLowerCase() === 'outra' : false);
    if (!funcaoSelecionada || funcaoSelecionada.name.toLowerCase() !== 'outra') {
      setManualCustomFuncaoInput('');
    }
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) { alert("Usuário não logado."); return; }
    if (!manualDate || !manualStartTime || !manualEndTime || !manualClientId || !manualFuncaoId) {
      alert('Preencha todos os campos obrigatórios (Data, Início, Fim, Cliente, Função).'); return;
    }
    const funcaoSelecionadaManual = allFuncoes.find(f => f.id === manualFuncaoId);
    if (funcaoSelecionadaManual && funcaoSelecionadaManual.name.toLowerCase() === 'outra' && !manualCustomFuncaoInput) {
      alert('Insira a função personalizada.'); return;
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
    const commentForManualRecord = funcaoSelecionadaManual && funcaoSelecionadaManual.name.toLowerCase() === 'outra' ? manualCustomFuncaoInput : '';

    const newTimeRecord: Partial<TimeRecord> = {
      id: `rec-manual-${Date.now()}`,
      userId: user.id,
      date: formattedDate,
      startTime: manualStartTime,
      endTime: manualEndTime,
      totalWorkTime: manualTotalMinutes,
      status: 'Manual',
      clientId: manualClientId,
      funcaoId: manualFuncaoId,
      comment: commentForManualRecord,
      usedEntryTolerance: false,
      usedExitTolerance: false
    };
    saveTimeRecordForEmployee(user.id, newTimeRecord as TimeRecord);
    alert(`Registro manual adicionado. Tempo: ${hours}h ${minutes}m`);
    
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualStartTime('');
    setManualEndTime('');
    // Manter cliente e função padrão pode ser útil
    // setManualClientIdState(currentUserData?.defaultClientId || (availableClientsForTimer.length > 0 ? availableClientsForTimer[0].id : ''));
    // setManualFuncaoId(currentUserData?.defaultFuncaoId || (availableFuncoesForTimer.length > 0 ? availableFuncoesForTimer[0].id : ''));
    setManualCustomFuncaoInput('');
    setShowManualCustomFuncaoInput(false);
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
                  {availableClientsForTimer.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="selectedFuncaoId" className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
                <select
                  id="selectedFuncaoId"
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={selectedFuncaoId}
                  onChange={handleFuncaoChange}
                  disabled={isRunning}
                >
                  <option value="">Selecione uma função</option>
                  {availableFuncoesForTimer.map(funcao => (
                    <option key={funcao.id} value={funcao.id}>{funcao.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {showCustomFuncaoInput && (
              <div>
                <label htmlFor="customFuncaoInput" className="block text-sm font-medium text-gray-700 mb-1">Especifique a Função (Outra) *</label>
                <input 
                  type="text"
                  id="customFuncaoInput"
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={customFuncaoInput}
                  onChange={(e) => setCustomFuncaoInput(e.target.value)}
                  disabled={isRunning}
                  placeholder="Detalhe a função personalizada"
                />
              </div>
            )}
          </div>
        )}

        <button 
          onClick={toggleTimer}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-150 flex items-center justify-center text-lg shadow-md hover:shadow-lg
            ${isRunning 
              ? 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-opacity-50'
              : 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:ring-opacity-50'}
          `}
        >
          {isRunning ? (
            <>
              <svg className="w-6 h-6 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path><path d="M12 8v4l3 3"></path></svg>
              PARAR CRONÔMETRO
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
              INICIAR CRONÔMETRO
            </>
          )}
        </button>
      </div>

      {/* Seção de Registro Manual */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Adicionar Registro Manual</h2>
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="manualDate" className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input type="date" id="manualDate" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required 
                     className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="manualClientIdState" className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select id="manualClientIdState" value={manualClientId} onChange={(e) => setManualClientIdState(e.target.value)} required
                      className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="">Selecione um cliente</option>
                {availableClientsForTimer.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="manualStartTime" className="block text-sm font-medium text-gray-700 mb-1">Hora de Início *</label>
              <input type="time" id="manualStartTime" value={manualStartTime} onChange={(e) => setManualStartTime(e.target.value)} required 
                     className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="manualEndTime" className="block text-sm font-medium text-gray-700 mb-1">Hora de Fim *</label>
              <input type="time" id="manualEndTime" value={manualEndTime} onChange={(e) => setManualEndTime(e.target.value)} required 
                     className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="manualFuncaoId" className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
              <select id="manualFuncaoId" value={manualFuncaoId} onChange={handleManualFuncaoChange} required
                      className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="">Selecione uma função</option>
                {availableFuncoesForTimer.map(funcao => (
                  <option key={funcao.id} value={funcao.id}>{funcao.name}</option>
                ))}
              </select>
            </div>
            {showManualCustomFuncaoInput && (
              <div className="sm:col-span-2">
                <label htmlFor="manualCustomFuncaoInput" className="block text-sm font-medium text-gray-700 mb-1">Especifique a Função (Outra) *</label>
                <input type="text" id="manualCustomFuncaoInput" value={manualCustomFuncaoInput} onChange={(e) => setManualCustomFuncaoInput(e.target.value)} 
                       className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                       placeholder="Detalhe a função personalizada"/>
              </div>
            )}
          </div>
          <button type="submit" 
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150">
            Adicionar Registro Manual
          </button>
        </form>
      </div>
    </div>
  );
}

