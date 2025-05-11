
'use client';

import React, { useEffect, useState, FormEvent, ChangeEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Client, Employee, Funcao } from '../../../../lib/time-tracking-models'; // Adicionado Funcao

// Componente interno para usar useSearchParams e ser envolvido por Suspense
function EditEmployeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');

  const [formData, setFormData] = useState<Partial<Employee & { password_confirm?: string }>>({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    status: 'active',
    password: '',
    password_confirm: '',
    assignedClientIds: [],
    defaultClientId: '',
    assignedFuncaoIds: [], // Novo
    defaultFuncaoId: ''    // Novo
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]); // Novo
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
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

    const storedFuncoes = localStorage.getItem('timetracker_funcoes'); // Novo
    if (storedFuncoes) {
      try {
        const parsedFuncoes: Funcao[] = JSON.parse(storedFuncoes);
        setFuncoes(parsedFuncoes.filter(funcao => funcao.status === 'active'));
      } catch (e) {
        console.error("Erro ao carregar funções do localStorage:", e);
        setFuncoes([]);
      }
    }

    if (employeeId) {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        try {
          const employees: Employee[] = JSON.parse(storedEmployees);
          const employeeToEdit = employees.find(emp => emp.id === employeeId);
          if (employeeToEdit) {
            const { password, ...employeeDetails } = employeeToEdit;
            setFormData({
              ...employeeDetails,
              password: '', // Não preencher a senha por segurança
              password_confirm: '',
              assignedClientIds: employeeToEdit.assignedClientIds || [],
              defaultClientId: employeeToEdit.defaultClientId || '',
              assignedFuncaoIds: employeeToEdit.assignedFuncaoIds || [], // Novo
              defaultFuncaoId: employeeToEdit.defaultFuncaoId || ''    // Novo
            });
          } else {
            setError('Funcionário não encontrado.');
          }
        } catch (e) {
          setError('Erro ao carregar dados do funcionário.');
          console.error(e);
        }
      }
    } else {
      setError('ID do funcionário não fornecido.');
    }
    setLoading(false);
  }, [employeeId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSaveChanges = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (formData.password && formData.password !== formData.password_confirm) {
      setError('As senhas não coincidem.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.startDate) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setIsSubmitting(false);
        return;
    }

    try {
      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      if (!Array.isArray(employees)) employees = [];

      const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
      if (employeeIndex === -1) {
        setError('Funcionário não encontrado para atualização.');
        setIsSubmitting(false);
        return;
      }

      const originalPassword = employees[employeeIndex].password;
      const updatedEmployee: Employee = {
        ...employees[employeeIndex], // Mantém campos não editáveis como timeRecords
        id: employeeId!, // Garante que o ID não seja perdido
        name: formData.name!,
        email: formData.email!,
        department: formData.department!,
        position: formData.position!,
        startDate: formData.startDate!,
        status: formData.status!,
        password: formData.password ? formData.password : originalPassword, // Atualiza senha apenas se fornecida
        assignedClientIds: formData.assignedClientIds || [],
        defaultClientId: formData.defaultClientId || '',
        assignedFuncaoIds: formData.assignedFuncaoIds || [], // Novo
        defaultFuncaoId: formData.defaultFuncaoId || ''    // Novo
      };

      employees[employeeIndex] = updatedEmployee;
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));

      alert('Dados do funcionário atualizados com sucesso!');
      router.push('/admin/employees');
    } catch (err) {
      console.error('Erro ao salvar funcionário:', err);
      setError('Ocorreu um erro ao salvar as alterações do funcionário.');
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteEmployee = (): void => {
    if (!employeeId) return;
    if (confirm('Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.')) {
      try {
        const storedEmployees = localStorage.getItem('timetracker_employees');
        if (storedEmployees) {
          let employees: Employee[] = JSON.parse(storedEmployees);
          const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
          localStorage.setItem('timetracker_employees', JSON.stringify(updatedEmployees));
          alert('Funcionário excluído com sucesso.');
          router.push('/admin/employees');
        }
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        alert('Erro ao excluir funcionário.');
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Carregando dados do funcionário...</div>;
  }

  if (error && !formData.name) { // Se houve erro e não carregou o nome, o funcionário não foi encontrado
    return <div className="container mx-auto px-4 py-8 text-red-500 text-center">{error}</div>;
  }

  const assignedClientsForDefaultSelection = clients.filter(client => 
    formData.assignedClientIds?.includes(client.id)
  );

  const assignedFuncoesForDefaultSelection = funcoes.filter(funcao => // Novo
    formData.assignedFuncaoIds?.includes(funcao.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Editar Funcionário: {formData.name || employeeId}</h1>
      
      <div className="bg-white shadow-xl rounded-lg p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
            {error}
          </div>
        )}
        
        <form id="editEmployeeForm" onSubmit={handleSaveChanges} className="space-y-8">
          {/* Informações Básicas */}
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
                  value={formData.name || ''}
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
                  value={formData.email || ''}
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
                  value={formData.department || ''}
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
                  value={formData.position || ''}
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
                  value={formData.startDate || ''}
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
                  value={formData.status || 'active'}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alterar Senha */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Alterar Senha (Opcional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Nova Senha
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="password" 
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  value={formData.password || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password_confirm">
                  Confirmar Nova Senha
                </label>
                <input 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="password_confirm" 
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={formData.password_confirm || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Atribuição de Clientes */}
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
                                        name="assignedClientIds"
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
                        <p className="text-sm text-gray-500">Nenhum cliente ativo encontrado.</p>
                    )}
                </div>

                {formData.assignedClientIds && formData.assignedClientIds.length > 0 && (
                    <div>
                        <label htmlFor="defaultClientId" className="block text-sm font-medium text-gray-700 mb-1">Cliente Padrão</label>
                        <select
                            id="defaultClientId"
                            name="defaultClientId"
                            value={formData.defaultClientId || ''}
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
                            value={formData.defaultFuncaoId || ''}
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
          
          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-6 border-t mt-10">
            <button 
              type="button"
              onClick={handleDeleteEmployee}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir Funcionário
            </button>
            <div className="flex items-center">
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
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente wrapper para usar Suspense
export default function EditEmployeePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Carregando...</div>}>
      <EditEmployeeForm />
    </Suspense>
  );
}

