// frontend/src/pages/admin/components/AdminStats.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  People,
  MenuBook,
  AttachMoney,
  PendingActions
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchDashboardCharts } from '../services/adminApi';

// StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color, mr: 2 }}>
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
    </CardContent>
  </Card>
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
        console.log('Fetching chart data from /admin/dashboard-stats...');
        
        // Use the correct endpoint
        const response = await fetchDashboardCharts();
        console.log('Chart API Response:', response);
        
        // Check if we got data
        if (response.data && response.data.data) {
          console.log('Chart data received:', response.data.data);
          setChartData(response.data.data);
        } else {
          console.warn('No chart data in response');
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
    <Box sx={{ mb: 4 }}>
      {/* Error Message */}
      {error && (
        <Card sx={{ mb: 3, bgcolor: '#fff3cd', borderColor: '#ffeaa7' }}>
          <CardContent>
            <Typography color="warning.dark">
              Note: Using demo data. Charts API returned: {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats - FIXED GRID SYNTAX */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<People color="primary" />}
            color="#3f51b5"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Courses"
            value={stats?.totalCourses || 0}
            icon={<MenuBook color="success" />}
            color="#4caf50"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Published Courses"
            value={stats?.publishedCourses || 0}
            icon={<AttachMoney color="info" />}
            color="#2196f3"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Courses"
            value={stats?.pendingCourses || 0}
            icon={<PendingActions color="warning" />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Charts - FIXED GRID SYNTAX */}
      <Grid container spacing={3}>
        {/* Course Status Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Status Distribution
              </Typography>
              {loading ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LinearProgress sx={{ width: '80%' }} />
                </Box>
              ) : chartData?.courseStats && chartData.courseStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
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
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 8 }}>
                  No course data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Signups Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily User Signups (Last 7 Days)
              </Typography>
              {loading ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LinearProgress sx={{ width: '80%' }} />
                </Box>
              ) : chartData?.dailySignups && chartData.dailySignups.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.dailySignups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Signups" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 8 }}>
                  No signup data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminStats;