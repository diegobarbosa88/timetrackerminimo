
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Client, Employee, Funcao } from '../../../../lib/time-tracking-models'; // Ajuste o caminho

export default function AddEmployeePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Employee & { password_confirm?: string, assignedClientIds?: string[], defaultClientId?: string, assignedFuncaoIds?: string[], defaultFuncaoId?: string }>>({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    password: '',
    password_confirm: '',
    status: 'active',
    assignedClientIds: [],
    defaultClientId: '',
    assignedFuncaoIds: [], // Novo
    defaultFuncaoId: ''    // Novo
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]); // Novo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Carregar clientes do localStorage
    const storedClients = localStorage.getItem('timetracker_clients');
    if (storedClients) {
      try {
        const parsedClients: Client[] = JSON.parse(storedClients);
        setClients(parsedClients.filter(client => client.status === 'active'));
      } catch (e) {
        console.error("Erro ao carregar clientes do localStorage:", e);
        setClients([]);
      }
    }
    // Carregar funções do localStorage // Novo
    const storedFuncoes = localStorage.getItem('timetracker_funcoes');
    if (storedFuncoes) {
      try {
        const parsedFuncoes: Funcao[] = JSON.parse(storedFuncoes);
        setFuncoes(parsedFuncoes.filter(funcao => funcao.status === 'active'));
      } catch (e) {
        console.error("Erro ao carregar funções do localStorage:", e);
        setFuncoes([]);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type, name } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      if (name === 'assignedClientIds') {
        setFormData(prevData => {
          const existingAssignedClientIds = prevData.assignedClientIds || [];
          let newAssignedClientIds;
          if (checked) {
            newAssignedClientIds = [...existingAssignedClientIds, value];
          } else {
            newAssignedClientIds = existingAssignedClientIds.filter(clientId => clientId !== value);
          }
          const newDefaultClientId = newAssignedClientIds.includes(prevData.defaultClientId || '') ? prevData.defaultClientId : '';
          return {
            ...prevData,
            assignedClientIds: newAssignedClientIds,
            defaultClientId: newDefaultClientId,
          };
        });
      } else if (name === 'assignedFuncaoIds') { // Novo
        setFormData(prevData => {
          const existingAssignedFuncaoIds = prevData.assignedFuncaoIds || [];
          let newAssignedFuncaoIds;
          if (checked) {
            newAssignedFuncaoIds = [...existingAssignedFuncaoIds, value];
          } else {
            newAssignedFuncaoIds = existingAssignedFuncaoIds.filter(funcaoId => funcaoId !== value);
          }
          const newDefaultFuncaoId = newAssignedFuncaoIds.includes(prevData.defaultFuncaoId || '') ? prevData.defaultFuncaoId : '';
          return {
            ...prevData,
            assignedFuncaoIds: newAssignedFuncaoIds,
            defaultFuncaoId: newDefaultFuncaoId,
          };
        });
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        [id]: value
      }));
    }
  };

  const handleSaveEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('As senhas não coincidem.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.startDate || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    try {
      const newEmployeeId = 'EMP' + Date.now().toString().slice(-6);
      const newEmployee: Employee = {
        id: newEmployeeId,
        name: formData.name!,
        email: formData.email!,
        department: formData.department!,
        position: formData.position!,
        startDate: formData.startDate!,
        status: formData.status!,
        password: formData.password,
        assignedClientIds: formData.assignedClientIds || [],
        defaultClientId: formData.defaultClientId || '',
        assignedFuncaoIds: formData.assignedFuncaoIds || [], // Novo
        defaultFuncaoId: formData.defaultFuncaoId || '',   // Novo
        timeRecords: []
      };

      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      if (!Array.isArray(employees)) employees = [];
      
      employees.push(newEmployee);
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));

      alert('Funcionário adicionado com sucesso!');
      router.push('/admin/employees');
    } catch (err) {
      console.error('Erro ao salvar funcionário:', err);
      setError('Ocorreu um erro ao salvar o funcionário.');
      setIsSubmitting(false);
    }
  };

  const assignedClientsForDefaultSelection = clients.filter(client => 
    formData.assignedClientIds?.includes(client.id)
  );

  const assignedFuncoesForDefaultSelection = funcoes.filter(funcao => // Novo
    formData.assignedFuncaoIds?.includes(funcao.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Adicionar Novo Funcionário</h1>
      
      <div className="bg-white shadow-xl rounded-lg p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
            {error}
          </div>
        )}
        
        <form id="addEmployeeForm" onSubmit={handleSaveEmployee} className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Nome Completo *
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="name" 
                  type="text" 
                  placeholder="Nome e sobrenome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email *
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="email" 
                  type="email" 
                  placeholder="exemplo@dominio.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="department">
                  Departamento *
                </label>
                <select 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o departamento</option>
                  <option value="Operações">Operações</option>
                  <option value="Administração">Administração</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="position">
                  Cargo *
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="position" 
                  type="text" 
                  placeholder="Cargo ou posição"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">
                  Data de Início *
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="startDate" 
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                  Status *
                </label>
                <select 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Credenciais de Acesso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Senha *
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="password" 
                  type="password"
                  placeholder="Crie uma senha para o funcionário"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password_confirm">
                  Confirmar Senha *
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="password_confirm" 
                  type="password"
                  placeholder="Confirme a senha"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Esta senha permitirá ao funcionário iniciar sessão e registrar suas horas.</p>
          </div>

          {/* Seção de Atribuição de Clientes - Mantida como estava */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Atribuição de Clientes</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clientes Associados</label>
                    {clients.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                            {clients.map(client => (
                                <div key={client.id} className="flex items-center">
                                    <input
                                        id={`client-${client.id}`}
                                        name="assignedClientIds" // Mantido para lógica de clientes
                                        type="checkbox"
                                        value={client.id}
                                        checked={formData.assignedClientIds?.includes(client.id)}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`client-${client.id}`} className="ml-2 block text-sm text-gray-900">
                                        {client.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Nenhum cliente ativo encontrado. Adicione clientes na seção 'Clientes' para poder associá-los.</p>
                    )}
                </div>

                {formData.assignedClientIds && formData.assignedClientIds.length > 0 && (
                    <div>
                        <label htmlFor="defaultClientId" className="block text-sm font-medium text-gray-700 mb-1">Cliente Padrão</label>
                        <select
                            id="defaultClientId"
                            name="defaultClientId"
                            value={formData.defaultClientId}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">Nenhum cliente padrão</option>
                            {assignedClientsForDefaultSelection.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Este cliente será pré-selecionado ao registrar horas.</p>
                    </div>
                )}
            </div>
          </div>

          {/* Nova Seção de Atribuição de Funções */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Atribuição de Funções</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Funções Associadas</label>
                    {funcoes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                            {funcoes.map(funcao => (
                                <div key={funcao.id} className="flex items-center">
                                    <input
                                        id={`funcao-${funcao.id}`}
                                        name="assignedFuncaoIds" // Novo name para lógica de funções
                                        type="checkbox"
                                        value={funcao.id}
                                        checked={formData.assignedFuncaoIds?.includes(funcao.id)}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`funcao-${funcao.id}`} className="ml-2 block text-sm text-gray-900">
                                        {funcao.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Nenhuma função ativa encontrada. Adicione funções na seção 'Funções' para poder associá-las.</p>
                    )}
                </div>

                {formData.assignedFuncaoIds && formData.assignedFuncaoIds.length > 0 && (
                    <div>
                        <label htmlFor="defaultFuncaoId" className="block text-sm font-medium text-gray-700 mb-1">Função Padrão</label>
                        <select
                            id="defaultFuncaoId"
                            name="defaultFuncaoId"
                            value={formData.defaultFuncaoId}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">Nenhuma função padrão</option>
                            {assignedFuncoesForDefaultSelection.map(funcao => (
                                <option key={funcao.id} value={funcao.id}>
                                    {funcao.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Esta função será pré-selecionada ao registrar horas.</p>
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex items-center justify-end pt-6 border-t mt-10">
            <button 
              type="button"
              onClick={() => router.push('/admin/employees')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button 
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Funcionário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

