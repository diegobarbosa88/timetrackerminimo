
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function StandaloneClientsListPage() {
  // const { user, loading } = useAuth(); // Removed useAuth
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [error, setError] = useState('');

  const fetchClients = useCallback(() => {
    setIsLoadingClients(true);
    try {
      const storedClients = localStorage.getItem('timetracker_clients');
      const loadedClients: Client[] = storedClients ? JSON.parse(storedClients) : [];
      setClients(loadedClients.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load client list.');
    }
    setIsLoadingClients(false);
  }, []);

  useEffect(() => {
    // if (!loading && (!user || user.role !== 'admin')) { // Removed auth check
    //   router.push('/auth/login');
    // } else if (user && user.role === 'admin') {
    //   fetchClients();
    // }
    fetchClients(); // Fetch clients directly for standalone version
  }, [fetchClients]); // Removed user, loading, router from dependencies as auth is removed

  // if (loading || isLoadingClients) { // Simplified loading check
  //   return <p className="text-center p-4">Loading...</p>;
  // }
  if (isLoadingClients) {
      return <p className="text-center p-4">Loading clients...</p>;
  }

  // if (!user || user.role !== 'admin') { // Removed auth check
  //   return <p className="text-center p-4 text-red-600">Access denied.</p>;
  // }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Clients (Standalone)</h1>
        <Link href="/admin/clients/add-client" legacyBehavior>
          <a className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Add New Client
          </a>
        </Link>
      </div>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}

      {clients.length === 0 && !isLoadingClients && (
        <p className="text-center text-gray-500 py-4">No clients found. Click 'Add New Client' to get started.</p>
      )}

      {clients.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/clients/edit-client/${client.id}`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-900">Edit</a>
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

