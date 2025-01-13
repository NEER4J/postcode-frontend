// pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import PostcodeSearch from '../components/PostcodeSearch';

interface Profile {
  new_api_key: string;
  email: string;
  full_name: string;
}

interface ApiUsage {
  endpoint: string;
  timestamp: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchApiUsage();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile');
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching API usage:', error);
        toast.error('Error loading API usage');
      } else {
        setApiUsage(data || []);
      }
    } catch (error) {
      console.error('API usage fetch error:', error);
      toast.error('Error loading API usage');
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/generate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const { apiKey } = await response.json();

      // Update the profile with the new API key
      const { error } = await supabase
        .from('profiles')
        .update({ new_api_key: apiKey })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      toast.success('API key generated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Error generating API key');
    }
  };

  const copyApiKey = () => {
    if (profile?.new_api_key) {
      navigator.clipboard.writeText(profile.new_api_key);
      toast.success('API key copied to clipboard');
    }
  };

  const handleApiUsage = async (endpoint: string, status: string) => {
    try {
      const { error } = await supabase
        .from('api_usage')
        .insert([
          {
            user_id: user?.id,
            endpoint,
            status,
            timestamp: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error logging API usage:', error);
      } else {
        fetchApiUsage();
      }
    } catch (error) {
      console.error('API usage logging error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">Please log in to access your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          {profile && (
            <div className="space-y-4">
              <p><span className="font-medium">Name:</span> {profile.full_name}</p>
              <p><span className="font-medium">Email:</span> {profile.email}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="font-medium">API Key:</span>
                  <code className="ml-2 p-1 bg-gray-100 rounded">
                    {profile.new_api_key}
                  </code>
                </div>
                <button
                  onClick={copyApiKey}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Copy API Key"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={generateApiKey}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Regenerate API Key"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {profile?.new_api_key ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <PostcodeSearch 
              apiKey={profile.new_api_key}
              onApiUsage={handleApiUsage}
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">Generate an API key to use the Postcode Search feature.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent API Usage</h2>
          <div className="overflow-x-auto">
            {apiUsage.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Endpoint</th>
                    <th className="text-left py-2 px-4">Timestamp</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apiUsage.map((usage, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{usage.endpoint}</td>
                      <td className="py-2 px-4">
                        {new Date(usage.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          usage.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usage.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No API usage recorded yet. Try using the Postcode Search above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}