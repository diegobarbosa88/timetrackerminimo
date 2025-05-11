
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Funcao as ModelFuncao } from '../../../lib/time-tracking-models'; // Ajuste o caminho conforme necessário

// Define Funcao interface diretamente no arquivo para este componente
interface Funcao extends ModelFuncao {}

export default function FuncoesListPage() {
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [isLoadingFuncoes, setIsLoadingFuncoes] = useState(true);
  const [error, setError] = useState('');

  const fetchFuncoes = useCallback(() => {
    setIsLoadingFuncoes(true);
    try {
      const storedFuncoes = localStorage.getItem('timetracker_funcoes');
      const loadedFuncoes: Funcao[] = storedFuncoes ? JSON.parse(storedFuncoes) : [];
      setFuncoes(loadedFuncoes.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Erro ao carregar funções:', err);
      setError('Falha ao carregar a lista de funções.');
    }
    setIsLoadingFuncoes(false);
  }, []);

  useEffect(() => {
    fetchFuncoes();
  }, [fetchFuncoes]);

  if (isLoadingFuncoes) {
      return <p className="text-center p-4">Carregando funções...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Funções</h1>
        <Link href="/admin/funcoes/add-funcao" legacyBehavior>
          <a className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Adicionar Nova Função
          </a>
        </Link>
      </div>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}

      {funcoes.length === 0 && !isLoadingFuncoes && (
        <p className="text-center text-gray-500 py-4">Nenhuma função encontrada. Clique em 'Adicionar Nova Função' para começar.</p>
      )}

      {funcoes.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {funcoes.map((funcao) => (
                <tr key={funcao.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{funcao.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{funcao.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm truncate max-w-xs" title={funcao.description}>{funcao.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${funcao.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {funcao.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/funcoes/edit-funcao/${funcao.id}`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-900">Editar</a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

