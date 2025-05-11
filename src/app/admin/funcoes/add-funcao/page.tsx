
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Funcao as ModelFuncao } from '../../../../lib/time-tracking-models'; // Ajuste o caminho

// Define Funcao interface diretamente no arquivo
interface Funcao extends ModelFuncao {}

const getNextFuncaoId = (funcoes: Funcao[]): string => {
  if (!funcoes || funcoes.length === 0) {
    return 'FUNC001';
  }
  // Encontra o maior número de ID existente e incrementa
  let maxIdNum = 0;
  funcoes.forEach(f => {
    const num = parseInt(f.id.replace('FUNC', ''), 10);
    if (!isNaN(num) && num > maxIdNum) {
      maxIdNum = num;
    }
  });
  const nextNumber = maxIdNum + 1;
  return `FUNC${nextNumber.toString().padStart(3, '0')}`;
};

export default function AddFuncaoPage() {
  const router = useRouter();
  const [funcaoName, setFuncaoName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!funcaoName.trim()) {
      setError('O nome da função é obrigatório.');
      return;
    }
    try {
      const existingFuncoesString = localStorage.getItem('timetracker_funcoes');
      const existingFuncoes: Funcao[] = existingFuncoesString ? JSON.parse(existingFuncoesString) : [];
      
      // Verificar se já existe uma função com o mesmo nome (case-insensitive)
      if (existingFuncoes.some(f => f.name.toLowerCase() === funcaoName.trim().toLowerCase())) {
        setError('Já existe uma função com este nome.');
        return;
      }
      
      const newFuncaoId = getNextFuncaoId(existingFuncoes);
      const newFuncao: Funcao = {
        id: newFuncaoId,
        name: funcaoName.trim(),
        description: description.trim(),
        status: status,
      };
      existingFuncoes.push(newFuncao);
      localStorage.setItem('timetracker_funcoes', JSON.stringify(existingFuncoes));
      setSuccessMessage(`Função "${newFuncao.name}" adicionada com sucesso! ID: ${newFuncao.id}`);
      setFuncaoName('');
      setDescription('');
      setStatus('active');
      // router.push('/admin/funcoes'); // Opcional: redirecionar após salvar
    } catch (err) {
      console.error('Erro ao salvar função:', err);
      setError('Falha ao salvar a função.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Nova Função</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="funcaoName" className="block text-sm font-medium text-gray-700">Nome da Função <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="funcaoName"
            value={funcaoName}
            onChange={(e) => setFuncaoName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.push('/admin/funcoes')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Salvar Função
          </button>
        </div>
      </form>
    </div>
  );
}

