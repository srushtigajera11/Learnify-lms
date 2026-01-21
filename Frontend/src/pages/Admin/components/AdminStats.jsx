import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { fetchDashboardCharts } from '../services/adminApi';

// StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded border border-gray-200 shadow-sm">
    <div className="p-4">
      <div className="flex items-center mb-2">
        <div className={`mr-3 ${color}`}>
          {icon}
        </div>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const AdminStats = ({ stats }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the correct endpoint
        const response = await fetchDashboardCharts();
        
        // Check if we got data
        if (response.data && response.data.data) {
          setChartData(response.data.data);
        } else {
          setChartData({
            dailySignups: [],
            courseStats: []
          });
        }
      } catch (error) {
        console.error('Failed to load chart data:', error);
        setError(error.message);
        
        // Create mock data for demonstration
        setChartData({
          dailySignups: [
            { _id: '2024-01-01', count: 5 },
            { _id: '2024-01-02', count: 8 },
            { _id: '2024-01-03', count: 12 },
            { _id: '2024-01-04', count: 7 },
            { _id: '2024-01-05', count: 9 },
            { _id: '2024-01-06', count: 11 },
            { _id: '2024-01-07', count: 6 }
          ],
          courseStats: [
            { _id: 'published', count: stats?.publishedCourses || 5 },
            { _id: 'pending', count: stats?.pendingCourses || 2 },
            { _id: 'draft', count: 1 },
            { _id: 'rejected', count: 1 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, [stats]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="mb-8">
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded mb-6 p-4">
          <p className="text-yellow-800">
            Note: Using demo data. Charts API returned: {error}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={<BookOpen className="w-6 h-6 text-green-600" />}
          color="text-green-600"
        />
        <StatCard
          title="Published Courses"
          value={stats?.publishedCourses || 0}
          icon={<DollarSign className="w-6 h-6 text-blue-400" />}
          color="text-blue-400"
        />
        <StatCard
          title="Pending Courses"
          value={stats?.pendingCourses || 0}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          color="text-yellow-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Status Pie Chart */}
        <div className="bg-white rounded border border-gray-200 shadow-sm">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Status Distribution
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-4/5 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : chartData?.courseStats && chartData.courseStats.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.courseStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry._id}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.courseStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No course data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Signups Bar Chart */}
        <div className="bg-white rounded border border-gray-200 shadow-sm">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily User Signups (Last 7 days)
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-4/5 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : chartData?.dailySignups && chartData.dailySignups.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.dailySignups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Signups" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No signup data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;