import React, { useEffect, useState } from 'react';
import { 
  Copy, 
  RefreshCw, 
  User, 
  Mail, 
  Key, 
  Activity, 
  Loader, 
  AlertCircle,
  ChevronRight,
  Globe,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import PostcodeSearch from '../components/PostcodeSearch';
import DomainManagement from '../components/DomainManagement';

interface Profile {
  new_api_key: string;
  email: string;
  full_name: string;
  allowed_domains?: string[];
}

interface ApiUsage {
  endpoint: string;
  timestamp: string;
  status: string;
}

// Reusable card component
const DashboardCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

// Stat card component
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="p-2 ">
      <Icon className="text-blue-600" size={20} />
    </div>
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-semibold text-gray-900">{value}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

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

      if (error) throw error;
      setProfile(data);
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

      if (error) throw error;
      setApiUsage(data || []);
    } catch (error) {
      console.error('API usage fetch error:', error);
      toast.error('Error loading API usage');
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch('https://product-soft.webuildtrades.com/post-code-lookup/api/generate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) throw new Error('Failed to generate API key');

      const { apiKey } = await response.json();
      await supabase
        .from('profiles')
        .update({ new_api_key: apiKey })
        .eq('id', user?.id);

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
      await supabase
        .from('api_usage')
        .insert([{
          user_id: user?.id,
          endpoint,
          status,
          timestamp: new Date().toISOString(),
        }]);
      fetchApiUsage();
    } catch (error) {
      console.error('API usage logging error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <p className="text-yellow-700">Please log in to access your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const successCount = apiUsage.filter(usage => usage.status === 'success').length;
  const totalRequests = apiUsage.length;
  const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.full_name}</h1>
            <p className="text-gray-600 mt-2">Manage your API keys and monitor your usage</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              icon={Search} 
              label="Total Requests" 
              value={totalRequests.toString()}
            />
            <StatCard 
              icon={Activity} 
              label="Success Rate" 
              value={`${successRate}%`}
            />
            <StatCard 
              icon={Globe} 
              label="Allowed Domains" 
              value={profile?.allowed_domains?.length || 0}
            />
          </div>

          {/* Profile Section */}
          <DashboardCard>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
            </div>
            {profile && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <div className="text-sm text-gray-600">Full Name</div>
                      <div className="font-medium">{profile.full_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{profile.email}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 p-4 bg-white rounded-lg border border-gray-100">
  <div className="flex items-start sm:items-center gap-3">
    <Key className="text-gray-400 mt-1 sm:mt-0" size={20} />
    <div className="min-w-0 flex-1">
      <div className="text-sm text-gray-600 mb-1">API Key</div>
      <div className="font-mono bg-gray-50 px-3 py-1.5 rounded-lg text-sm overflow-x-auto whitespace-nowrap">
        {showApiKey ? profile.new_api_key : '•'.repeat(40)}
      </div>
    </div>
  </div>
  
  <div className="flex items-center gap-2 mt-3 sm:mt-0 border-t sm:border-t-0 pt-3 sm:pt-0">
    <button
      onClick={() => setShowApiKey(!showApiKey)}
      className="flex-1 sm:flex-none px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      title={showApiKey ? "Hide API Key" : "Show API Key"}
    >
      {showApiKey ? "Hide" : "Show"}
    </button>
    <button
      onClick={copyApiKey}
      className="flex-1 sm:flex-none px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      title="Copy API Key"
    >
      <Copy size={20} className="mx-auto" />
    </button>
    <button
      onClick={generateApiKey}
      className="flex-1 sm:flex-none px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      title="Regenerate API Key"
    >
      <RefreshCw size={20} className="mx-auto" />
    </button>
  </div>
</div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <DomainManagement
                    profile={profile}
                    onUpdate={fetchProfile}
                  />
                </div>
              </div>
            )}
          </DashboardCard>

          {/* Postcode Search Testing */}
          {profile?.new_api_key ? (
            <DashboardCard>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Test Your API</h2>
              </div>
              <PostcodeSearch 
                apiKey={profile.new_api_key}
                onApiUsage={handleApiUsage}
              />
            </DashboardCard>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <p className="text-yellow-700">Generate an API key to test the Postcode Search feature.</p>
            </div>
          )}

          {/* API Usage Table */}
          <DashboardCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent API Usage</h2>
              <div className="text-sm text-gray-500">Last 10 requests</div>
            </div>
            
            <div className="overflow-x-auto">
              {apiUsage.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="py-3 px-4 text-gray-600 font-medium">Endpoint</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Timestamp</th>
                      <th className="py-3 px-4 text-gray-600 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiUsage.map((usage, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-sm">{usage.endpoint}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(usage.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">No API usage recorded yet</p>
                  <p className="text-sm text-gray-400">
                    Try using the Postcode Search above to see your requests here
                  </p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}