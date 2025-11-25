// src/pages/tutor/Earnings.jsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Avatar,
  Stack,
  alpha
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  TrendingUp,
  AccountBalanceWallet,
  School,
  Payments,
  CalendarToday
} from "@mui/icons-material";

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [summary, setSummary] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    monthlyEarnings: 0
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axiosInstance.get("/analytics/tutor/earnings", {
          withCredentials: true,
        });

        console.log("Earnings data:", res.data);

        const earningsList = res.data.earningsList || [];
        const total = res.data.totalEarnings || 0;

        // Calculate stats
        const totalStudents = earningsList.reduce((sum, item) => sum + (item.students || 0), 0);
        const totalCourses = earningsList.length;
        const monthlyEarnings = total * 0.3; // Mock monthly earnings (30% of total)

        setTotalEarnings(total);
        setSummary(earningsList);
        setStats({
          totalStudents,
          totalCourses,
          monthlyEarnings
        });
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const StatCard = ({ icon, title, value, subtitle, color = "primary" }) => (
    <Card 
      elevation={2} 
      sx={{ 
        borderRadius: 3,
        background: `linear(135deg, ${alpha('#6a11cb', 0.1)} 0%, ${alpha('#2575fc', 0.1)} 100%)`,
        border: `1px solid ${alpha('#6a11cb', 0.2)}`,
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Earnings Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your course revenue and student enrollments
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<AccountBalanceWallet />}
                title="Total Earnings"
                value={`₹${totalEarnings.toFixed(2)}`}
                subtitle="Lifetime revenue"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<TrendingUp />}
                title="Monthly Revenue"
                value={`₹${stats.monthlyEarnings.toFixed(2)}`}
                subtitle="Current month"
                color="success"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<School />}
                title="Total Students"
                value={stats.totalStudents.toString()}
                subtitle="Across all courses"
                color="info"
              />
            </Grid>
          </Grid>

          {/* Earnings Table */}
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha('#000', 0.1)}`
            }}
          >
            <Box sx={{ 
              p: 3, 
              borderBottom: `1px solid ${alpha('#000', 0.1)}`,
              bgcolor: alpha('#6a11cb', 0.02)
            }}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                Course Earnings Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed revenue analysis per course
              </Typography>
            </Box>

            {summary.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Payments sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No earnings data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your earnings will appear here once students enroll in your courses
                </Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#6a11cb', 0.04) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Course Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Students</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Total Earned</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.map((item, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:hover': { bgcolor: alpha('#6a11cb', 0.02) },
                        transition: '0.2s'
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {item.courseTitle}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Chip 
                          label={item.students} 
                          size="small" 
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          ₹{(item.totalEarnings / item.students).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          ₹{item.totalEarnings.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Chip 
                          label="Active" 
                          size="small" 
                          color="success"
                          variant="filled"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* Summary Footer */}
          {summary.length > 0 && (
            <Paper 
              elevation={1} 
              sx={{ 
                mt: 3, 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha('#6a11cb', 0.05),
                border: `1px solid ${alpha('#6a11cb', 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {summary.length} courses with active enrollments
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Total: ₹{totalEarnings.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default Earnings;