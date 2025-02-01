import React, { useEffect, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  new_api_key: string;
  rate_limit: number;
  request_count: number;
  last_request_time: string;
}

const Alert = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div
    className={`px-4 py-3 rounded-lg ${
      type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
      'bg-red-50 text-red-800 border border-red-200'
    }`}
  >
    {message}
  </div>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://product-soft.webuildtrades.com/post-code-lookup';

  useEffect(() => {
    // Check if user is admin after auth loading is complete
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    // Only fetch users if user is admin
    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRateLimit = async (userId: string, rateLimit: number) => {
    try {
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rateLimit }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, rate_limit: rateLimit } : user
        ));
        setUpdateMessage({ type: 'success', message: 'Rate limit updated successfully!' });
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setUpdateMessage({ type: 'error', message: 'Failed to update rate limit' });
      }
    } catch (error) {
      console.error('Error updating rate limit:', error);
      setUpdateMessage({ type: 'error', message: 'Error updating rate limit' });
    }

    setTimeout(() => setUpdateMessage(null), 3000);
  };

  const toggleApiKeyVisibility = (userId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Show loading state while checking auth or fetching data
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not admin, render nothing (redirect will happen via useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>
          {updateMessage && (
            <div className="w-96">
              <Alert message={updateMessage.message} type={updateMessage.type} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate Limit</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-50 px-2 py-1 rounded font-mono">
                          {showApiKey[user.id] ? user.new_api_key : '••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleApiKeyVisibility(user.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showApiKey[user.id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={user.rate_limit}
                          onChange={e => {
                            const newValue = parseInt(e.target.value) || 0;
                            setUsers(users.map(u => 
                              u.id === user.id ? { ...u, rate_limit: newValue } : u
                            ));
                          }}
                          min="0"
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => updateRateLimit(user.id, user.rate_limit)}
                          className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{user.request_count} requests</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {new Date(user.last_request_time).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;