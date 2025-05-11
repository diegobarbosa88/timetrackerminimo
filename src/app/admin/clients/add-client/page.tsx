
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define Client interface directly in the file
interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: 'active' | 'inactive';
}

const getNextClientId = (clients: Client[]): string => {
  if (!clients || clients.length === 0) {
    return 'CLI001';
  }
  const lastId = clients[clients.length - 1].id;
  const lastNumber = parseInt(lastId.replace('CLI', ''), 10);
  const nextNumber = lastNumber + 1;
  return `CLI${nextNumber.toString().padStart(3, '0')}`;
};

export default function StandaloneAddClientPage() {
  // const { user, loading } = useAuth(); // Removed useAuth
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // useEffect(() => { // Removed useEffect for auth check
  //   if (!loading && (!user || user.role !== 'admin')) {
  //     router.push('/auth/login');
  //   }
  // }, [user, loading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!clientName.trim()) {
      setError('Client name is required.');
      return;
    }
    try {
      const existingClientsString = localStorage.getItem('timetracker_clients');
      const existingClients: Client[] = existingClientsString ? JSON.parse(existingClientsString) : [];
      const newClientId = getNextClientId(existingClients);
      const newClient: Client = {
        id: newClientId,
        name: clientName.trim(),
        contactPerson: '', // Simplified for standalone
        contactEmail: '',  // Simplified for standalone
        contactPhone: '', // Simplified for standalone
        address: '',      // Simplified for standalone
        status: status,
      };
      existingClients.push(newClient);
      localStorage.setItem('timetracker_clients', JSON.stringify(existingClients));
      setSuccessMessage(`Client "${newClient.name}" added successfully! ID: ${newClient.id}`);
      setClientName('');
      setStatus('active');
      // router.push('/admin/clients'); // Optional: redirect after save
    } catch (err) {
      console.error('Error saving client:', err);
      setError('Failed to save client.');
    }
  };

  // if (loading) { // Removed loading check
  //   return <p className="text-center p-4">Loading...</p>;
  // }
  // if (!user || user.role !== 'admin') { // Removed auth check
  //   return <p className="text-center p-4 text-red-600">Access denied.</p>;
  // }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Client (Standalone)</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.push('/admin/clients')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Save Client
          </button>
        </div>
      </form>
    </div>
  );
}

