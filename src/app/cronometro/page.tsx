'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';

export default function CronometroPage() {
  const { user, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [timer, setTimer] = useState('00:00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedClient, setSelectedClient] = useState('MAGNETIC PLACE');
  const [selectedTag, setSelectedTag] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);

  // Estado para registro manual
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]); // Data no formato YYYY-MM-DD
  const [manualStartTime, setManualStartTime] = useState(''); // Hora de início HH:MM
  const [manualEndTime, setManualEndTime] = useState(''); // Hora de fim HH:MM
  const [manualClient, setManualClient] = useState('MAGNETIC PLACE');
  const [manualTag, setManualTag] = useState('');
  const [manualCustomTag, setManualCustomTag] = useState('');
  const [showManualCustomTag, setShowManualCustomTag] = useState(false);

  // Lista de clientes
  const clients = [
    'MAGNETIC PLACE',
    'Cliente A',
    'Cliente B',
    'Cliente C'
  ];

  // Lista de etiquetas predefinidas
  const tags = [
    'Desenvolvimento',
    'Design',
    'Reunião',
    'Suporte',
    'Administrativo',
    'Outro'
  ];

  // Atualizar hora e data atual
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const dayOfWeek = days[now.getDay()];
      const dayOfMonth = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`Hoje é ${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Manejar el cronómetro automático
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const newElapsedTime = elapsedTime + (now - startTime);
        setStartTime(now);
        setElapsedTime(newElapsedTime);
        const totalSeconds = Math.floor(newElapsedTime / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        setTimer(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, startTime, elapsedTime]);

  // Iniciar ou pausar o cronômetro automático
  const toggleTimer = () => {
    if (!isRunning) {
      if (showCustomTag && !customTag && selectedTag === 'Outro') {
        alert('Por favor, insira uma etiqueta personalizada');
        return;
      }
      const finalTag = selectedTag === 'Outro' ? customTag : selectedTag;
      setStartTime(Date.now());
      setIsRunning(true);
      const startRecord = {
        userId: user?.id,
        userName: user?.name,
        clientId: selectedClient,
        tag: finalTag,
        startTime: new Date().toISOString(),
        date: new Date().toLocaleDateString('pt-BR') // Formato PT-BR
      };
      console.log('Início de jornada registrado:', startRecord);
      localStorage.setItem('currentTimeRecord', JSON.stringify(startRecord));
    } else {
      setIsRunning(false);
      const savedRecord = localStorage.getItem('currentTimeRecord');
      if (!savedRecord) {
        console.error('Não foi encontrado o registro de início');
        return;
      }
      const startRecord = JSON.parse(savedRecord);
      const now = new Date();
      const completeRecord = {
        userId: startRecord.userId,
        userName: startRecord.userName,
        clientId: startRecord.clientId,
        tag: startRecord.tag,
        startTime: startRecord.startTime,
        endTime: now.toISOString(),
        elapsedTime: elapsedTime,
        date: startRecord.date
      };
      const totalMinutes = Math.floor(elapsedTime / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeRecord = {
        date: startRecord.date,
        entry: new Date(startRecord.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        exit: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        total: `${hours}h ${minutes}m`,
        status: 'Completado',
        client: startRecord.clientId,
        tag: startRecord.tag
      };
      saveTimeRecordForEmployee(startRecord.userId, timeRecord);
      console.log('Jornada completa registrada:', completeRecord);
      localStorage.removeItem('currentTimeRecord');
      setTimer('00:00:00');
      setElapsedTime(0);
      alert(`Jornada finalizada corretamente. Tempo trabalhado: ${hours}h ${minutes}m`);
    }
  };

  // Guardar registro de tiempo para el empleado
  const saveTimeRecordForEmployee = (employeeId, timeRecord) => {
    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees = [];
      if (storedEmployees) {
          employees = JSON.parse(storedEmployees);
      } else {
          console.warn('Nenhum empregado encontrado no localStorage. Criando nova lista.');
          // Opcional: inicializar com dados de exemplo se necessário
      }

      const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
      if (employeeIndex === -1) {
        // Se o empregado não for encontrado, adiciona um novo (ou loga um erro, dependendo da lógica desejada)
        console.warn(`Empregado com ID ${employeeId} não encontrado. Adicionando novo registro pode não funcionar como esperado sem um empregado existente.`);
        // Poderia adicionar o empregado aqui se fizesse sentido
        // employees.push({ id: employeeId, name: user?.name || 'Nome Desconhecido', timeRecords: [timeRecord] });
        console.error('Empregado não encontrado. Não é possível salvar o registro de tempo.');
        return; // Impede salvar se o empregado não existe
      }

      if (!employees[employeeIndex].timeRecords) {
        employees[employeeIndex].timeRecords = [];
      }
      employees[employeeIndex].timeRecords.push(timeRecord);
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));
      console.log('Registro guardado para o empregado:', employeeId);
    } catch (error) {
      console.error('Erro ao guardar o registro de tempo:', error);
    }
  };

  // Manejar cambio de etiqueta (cronômetro)
  const handleTagChange = (e) => {
    const value = e.target.value;
    setSelectedTag(value);
    setShowCustomTag(value === 'Outro');
  };

  // Manejar cambio de etiqueta (manual)
  const handleManualTagChange = (e) => {
    const value = e.target.value;
    setManualTag(value);
    setShowManualCustomTag(value === 'Outro');
  };

  // Submeter registro manual
  const handleManualSubmit = (e) => {
    e.preventDefault();

    if (!manualDate || !manualStartTime || !manualEndTime || !manualClient || !manualTag) {
      alert('Por favor, preencha todos os campos obrigatórios (Data, Início, Fim, Cliente, Etiqueta).');
      return;
    }

    if (manualTag === 'Outro' && !manualCustomTag) {
      alert('Por favor, insira uma etiqueta personalizada para a opção "Outro".');
      return;
    }

    const finalManualTag = manualTag === 'Outro' ? manualCustomTag : manualTag;

    // Construir objetos Date completos para cálculo
    const startDateTimeStr = `${manualDate}T${manualStartTime}:00`;
    const endDateTimeStr = `${manualDate}T${manualEndTime}:00`;

    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(endDateTimeStr);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        alert('Formato de data ou hora inválido. Use YYYY-MM-DD para data e HH:MM para hora.');
        return;
    }

    if (endDateTime <= startDateTime) {
      alert('A hora de fim deve ser posterior à hora de início.');
      return;
    }

    const manualElapsedTime = endDateTime.getTime() - startDateTime.getTime(); // Em milissegundos
    const totalMinutes = Math.floor(manualElapsedTime / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Formatar data para pt-BR
    const formattedDate = new Date(manualDate + 'T00:00:00').toLocaleDateString('pt-BR');

    const timeRecord = {
      date: formattedDate,
      entry: manualStartTime, // Já está em HH:MM
      exit: manualEndTime,   // Já está em HH:MM
      total: `${hours}h ${minutes}m`,
      status: 'Completado Manualmente',
      client: manualClient,
      tag: finalManualTag
    };

    saveTimeRecordForEmployee(user?.id, timeRecord);

    alert(`Registro manual adicionado com sucesso. Tempo trabalhado: ${hours}h ${minutes}m`);

    // Limpar formulário manual
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualStartTime('');
    setManualEndTime('');
    // setManualClient('MAGNETIC PLACE'); // Manter o último cliente selecionado pode ser útil
    setManualTag('');
    setManualCustomTag('');
    setShowManualCustomTag(false);
  };

  // Verificar se há uma jornada em progresso ao carregar a página
  useEffect(() => {
    const savedRecord = localStorage.getItem('currentTimeRecord');
    if (savedRecord) {
      try {
        const record = JSON.parse(savedRecord);
        const savedStartTime = new Date(record.startTime).getTime();
        const now = Date.now();
        const savedElapsedTime = now - savedStartTime;
        setSelectedClient(record.clientId);
        if (record.tag) {
          if (tags.includes(record.tag)) {
            setSelectedTag(record.tag);
          } else {
            setSelectedTag('Outro');
            setCustomTag(record.tag);
            setShowCustomTag(true);
          }
        }
        setStartTime(now);
        setElapsedTime(savedElapsedTime);
        setIsRunning(true);
        const totalSeconds = Math.floor(savedElapsedTime / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        setTimer(`${hours}:${minutes}:${seconds}`);
      } catch (error) {
        console.error('Erro ao carregar o registro de tempo guardado:', error);
        localStorage.removeItem('currentTimeRecord');
      }
    }
  }, []);

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Seção do Cronômetro Automático */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cronômetro Automático</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-700">Hora atual: <span className="font-semibold">{currentTime}</span></p>
            <p className="text-gray-700">Bem-vindo, <span className="font-semibold">{user?.name || 'Usuário'}</span></p>
            <p className="text-gray-700">{currentDate}</p>
          </div>
          <div className="flex items-start justify-end">
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${isRunning ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
              <span className={`w-2 h-2 mr-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              {isRunning ? 'Ativo' : 'Inativo'}
            </div>
          </div>
        </div>
        {!isRunning && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="client" className="block text-gray-700 mb-2">Cliente</label>
                <select
                  id="client"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  disabled={isRunning}
                >
                  {clients.map((client) => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tag" className="block text-gray-700 mb-2">Etiqueta</label>
                <select
                  id="tag"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTag}
                  onChange={handleTagChange}
                  disabled={isRunning}
                >
                  <option value="">Selecionar etiqueta</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
            {showCustomTag && (
              <div className="mb-6">
                <label htmlFor="customTag" className="block text-gray-700 mb-2">Etiqueta personalizada</label>
                <input
                  id="customTag"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Insira uma etiqueta personalizada"
                  disabled={isRunning}
                />
              </div>
            )}
          </>
        )}
        <div className="text-center py-8">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-8">{timer}</div>
          <button
            onClick={toggleTimer}
            disabled={!isRunning && (!selectedTag || (selectedTag === 'Outro' && !customTag))}
            className={`flex items-center justify-center mx-auto px-6 py-3 rounded-md text-white font-medium ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600'
                : (!selectedTag || (selectedTag === 'Outro' && !customTag))
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              {isRunning ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              )}
            </svg>
            {isRunning ? 'Finalizar Jornada' : 'Iniciar Jornada'}
          </button>
        </div>
        {!isRunning && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Instruções (Cronômetro):</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Selecione um cliente e uma etiqueta para a atividade.</li>
              <li>Clique em "Iniciar Jornada" para começar a registrar o tempo automaticamente.</li>
              <li>Quando terminar, clique em "Finalizar Jornada".</li>
              <li>O registro será guardado e aparecerá nos relatórios.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Seção de Registro Manual (só aparece se o cronômetro não estiver ativo) */}
      {!isRunning && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Registro Manual de Horas</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="manualDate" className="block text-gray-700 mb-1">Data</label>
                <input
                  id="manualDate"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="manualStartTime" className="block text-gray-700 mb-1">Hora Início</label>
                <input
                  id="manualStartTime"
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="manualEndTime" className="block text-gray-700 mb-1">Hora Fim</label>
                <input
                  id="manualEndTime"
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="manualClient" className="block text-gray-700 mb-1">Cliente</label>
                <select
                  id="manualClient"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualClient}
                  onChange={(e) => setManualClient(e.target.value)}
                  required
                >
                  {clients.map((client) => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="manualTag" className="block text-gray-700 mb-1">Etiqueta</label>
                <select
                  id="manualTag"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

            {showManualCustomTag && (
              <div>
                <label htmlFor="manualCustomTag" className="block text-gray-700 mb-1">Etiqueta personalizada</label>
                <input
                  id="manualCustomTag"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualCustomTag}
                  onChange={(e) => setManualCustomTag(e.target.value)}
                  placeholder="Insira a etiqueta personalizada"
                  required={manualTag === 'Outro'}
                />
              </div>
            )}

            <div className="text-right">
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Adicionar Registro Manual
              </button>
            </div>
          </form>
           <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Instruções (Registro Manual):</h3>
            <ol className="list-decimal list-inside text-green-700 space-y-1">
              <li>Preencha a data, hora de início e hora de fim do trabalho.</li>
              <li>Selecione o cliente e a etiqueta correspondente.</li>
              <li>Se escolher "Outro" como etiqueta, preencha o campo de etiqueta personalizada.</li>
              <li>Clique em "Adicionar Registro Manual".</li>
              <li>O registro será guardado e aparecerá nos relatórios.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

