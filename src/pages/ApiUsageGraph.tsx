import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Loader, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ApiUsage {
  id: string;
  user_id: string;
  endpoint: string;
  timestamp: string;
  status: string;
}

export default function ApiUsageGraph() {
  const { user } = useAuth();
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApiUsage();
    }
  }, [user]);

  const fetchApiUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setApiUsage(data || []);
    } catch (error) {
      console.error('API usage fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process API usage data for the graph
  const processGraphData = () => {
    const usageByDate: { [date: string]: { success: number; failed: number } } = {};

    apiUsage.forEach((usage) => {
      const date = new Date(usage.timestamp).toISOString().split('T')[0]; // Extract YYYY-MM-DD
      if (!usageByDate[date]) {
        usageByDate[date] = { success: 0, failed: 0 };
      }
      if (usage.status === 'success') {
        usageByDate[date].success += 1;
      } else {
        usageByDate[date].failed += 1;
      }
    });

    const labels = Object.keys(usageByDate);
    const successData = labels.map((date) => usageByDate[date].success);
    const failedData = labels.map((date) => usageByDate[date].failed);

    return {
      labels,
      datasets: [
        {
          label: 'Successful Requests',
          data: successData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Failed Requests',
          data: failedData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  const graphData = processGraphData();

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
              <p className="text-yellow-700">Please log in to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <Helmet>
        <title>API Usage Graph - PostCode API</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Usage Over Time</h1>
            <p className="text-gray-600 mt-2">Visualize your API usage with successful and failed requests per day.</p>
          </div>

          {/* Graph Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">API Usage Graph</h2>
            <div className="h-96">
              <Line
                data={graphData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'API Requests Over Time',
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Date',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Number of Requests',
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* API Usage Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">API Usage Details</h2>
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
                    {apiUsage.map((usage) => (
                      <tr 
                        key={usage.id} 
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
                  <p className="text-gray-500 mb-2">No API usage recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
