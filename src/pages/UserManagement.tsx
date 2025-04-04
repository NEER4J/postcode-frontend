import React, { useEffect, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface User {
  id: string;
  name: string;
  email: string;
  new_api_key: string;
  rate_limit: number;
  request_count: number;
  last_request_time: string;
}

interface AlertProps {
  message: string;
  type: 'success' | 'error';
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

interface UserCardProps {
  user: User;
  showApiKey: { [key: string]: boolean };
  onToggleApiKey: (userId: string) => void;
  onUpdateRateLimit: (userId: string, rateLimit: number, shouldUpdate: boolean) => void;
  onDeleteUser: (user: User) => void;
}

const Alert: React.FC<AlertProps> = ({ message, type }) => (
  <div className={`fixed top-4 right-4 z-50 transform transition-transform duration-300 ease-out ${
    message ? 'translate-y-0' : '-translate-y-full'
  }`}>
    <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <span className="text-sm font-medium">{message}</span>
    </div>
  </div>
);

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, userName }) => (
  <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black bg-opacity-50"></div>
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete {userName}? This action cannot be undone and will remove all associated data.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

const UserCard: React.FC<UserCardProps> = ({ user, showApiKey, onToggleApiKey, onUpdateRateLimit, onDeleteUser }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
        <span className="text-sm text-gray-600">{user.request_count}</span>
        <span className="text-xs text-gray-400">requests</span>
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-600">API Key</label>
        <div className="flex items-center space-x-2">
          <code className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded-lg font-mono truncate">
            {showApiKey[user.id] ? user.new_api_key : '••••••••••••'}
          </code>
          <button
            onClick={() => onToggleApiKey(user.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
          >
            {showApiKey[user.id] ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-600">Rate Limit</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={user.rate_limit}
            onChange={(e) => onUpdateRateLimit(user.id, parseInt(e.target.value) || 0, false)}
            min="0"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => onUpdateRateLimit(user.id, user.rate_limit, true)}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Update
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-600">Last Request</label>
        <span className="text-sm text-gray-500">
          {new Date(user.last_request_time).toLocaleString()}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onDeleteUser(user)}
          className="w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
        >
          Delete User
        </button>
      </div>
    </div>
  </div>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://product-soft.webuildtrades.com/post-code-lookup';

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRateLimit = async (userId: string, rateLimit: number, shouldUpdate: boolean = true) => {
    if (!shouldUpdate) {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, rate_limit: rateLimit } : user
      ));
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;

    try {
      const response = await fetch(`${backendUrl}/api/users/${deleteModal.user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== deleteModal.user?.id));
        setUpdateMessage({ type: 'success', message: 'User deleted successfully!' });
      } else {
        setUpdateMessage({ type: 'error', message: 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setUpdateMessage({ type: 'error', message: 'Error deleting user' });
    }

    setDeleteModal({ isOpen: false, user: null });
    setTimeout(() => setUpdateMessage(null), 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-16">
      <Helmet>
        <title>User Management - PostCode API</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Helmet>

      {updateMessage && <Alert message={updateMessage.message} type={updateMessage.type} />}
      
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDeleteUser}
        userName={deleteModal.user?.name || ''}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage user API access and rate limits</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              <span className="text-sm text-gray-500">Total Users:</span>
              <span className="ml-2 text-lg font-semibold text-gray-900">{users.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              showApiKey={showApiKey}
              onToggleApiKey={toggleApiKeyVisibility}
              onUpdateRateLimit={updateRateLimit}
              onDeleteUser={(user) => setDeleteModal({ isOpen: true, user })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;