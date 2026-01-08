// Dashboard.jsx - Update the stats fetching and add status chips
import React, { useEffect, useState } from "react";
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  Chip, 
  Button 
  , CircularProgress, Alert
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PendingIcon from "@mui/icons-material/Pending";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import SummaryCard from "../../Layout/TutorDashboardCard";
import EarningsChart from "../../Components/EarningsChart";
import CourseCard from "./CourseCard";
import QuickStatsChart from "../../Components/QuickStatsChart";
import RecentReviews from "../../Components/RecentReviews";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    monthlyEarnings: 0,
    pendingApprovals: 0,
    draftCount: 0,
    publishedCount: 0,
    rejectedCount: 0,
  });

  // Fetch courses with new endpoint
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/courses/tutor/courses?status=all");
        if (Array.isArray(res.data)) {
          setCourses(res.data);
          
          // Calculate stats from courses
          const draftCount = res.data.filter(c => c.status === 'draft').length;
          const pendingCount = res.data.filter(c => c.status === 'pending').length;
          const publishedCount = res.data.filter(c => c.status === 'published').length;
          const rejectedCount = res.data.filter(c => c.status === 'rejected').length;
          
          setStats(prev => ({
            ...prev,
            pendingApprovals: pendingCount,
            draftCount,
            publishedCount,
            rejectedCount
          }));
        } else {
          setError("Invalid data format received from server");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch additional stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          axiosInstance.get("/courses/tutor/stats"),
          axiosInstance.get("/analytics/tutor/stats", {
            withCredentials: true,
          }).catch(() => ({ data: { data: {} } })) // Fallback if analytics fails
        ]);
        
        // Merge stats from both endpoints
        setStats(prev => ({
          ...prev,
          ...statsRes.data,
          ...analyticsRes.data.data
        }));
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      draft: { 
        label: 'Draft', 
        color: 'default', 
        icon: <HourglassEmptyIcon fontSize="small" /> 
      },
      pending: { 
        label: 'Pending Review', 
        color: 'warning', 
        icon: <PendingIcon fontSize="small" /> 
      },
      published: { 
        label: 'Published', 
        color: 'success', 
        icon: <CheckCircleIcon fontSize="small" /> 
      },
      rejected: { 
        label: 'Rejected', 
        color: 'error', 
        icon: <WarningIcon fontSize="small" /> 
      },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const handleSubmitForReview = async (courseId) => {
    try {
      await axiosInstance.put(`/courses/${courseId}/submit`);
      // Refresh courses
      const res = await axiosInstance.get("/courses/tutor/courses?status=all");
      if (Array.isArray(res.data)) {
        setCourses(res.data);
      }
      alert("Course submitted for admin approval!");
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err.response?.data?.message || "Failed to submit for review");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        {/* Header with quick actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">
              Tutor Dashboard
            </Typography>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => navigate('/tutor/create-course')}
            >
              Create New Course
            </Button>
          </Box>
        </Grid>

        {/* Summary Cards - Updated with status counts */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Total Courses"
                value={stats.totalCourses || courses.length}
                icon={<LibraryBooksIcon sx={{ color: "#1e40af" }} />}
                color="#dbeafe"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Active Students"
                value={stats.totalEnrollments || 0}
                icon={<GroupIcon sx={{ color: "#047857" }} />}
                color="#d1fae5"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Pending Review"
                value={stats.pendingApprovals || 0}
                icon={<PendingIcon sx={{ color: "#b45309" }} />}
                color="#fef3c7"
                subtitle={`${stats.draftCount || 0} drafts ready`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Monthly Earnings"
                value={`₹${(stats.monthlyEarnings || 0).toLocaleString()}`}
                icon={<AttachMoneyIcon sx={{ color: "#b91c1c" }} />}
                color="#fee2e2"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Status Distribution Bar */}
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Course Status Distribution
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="Draft" 
                    color="default" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h5">{stats.draftCount || 0}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="Pending" 
                    color="warning" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h5">{stats.pendingApprovals || 0}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="Published" 
                    color="success" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h5">{stats.publishedCount || 0}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="Rejected" 
                    color="error" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h5">{stats.rejectedCount || 0}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Earnings Overview + Right Widgets */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Earnings Overview
                </Typography>
                <EarningsChart />
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <QuickStatsChart />
                </Grid>
                <Grid item xs={12}>
                  <RecentReviews />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* My Courses Section with Filter Tabs */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                My Courses
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/tutor/courses')}
                >
                  View All
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={() => navigate('/tutor/create-course')}
                >
                  New Course
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : courses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                  No courses available at the moment.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => navigate('/tutor/create-course')}
                  sx={{ mt: 2 }}
                >
                  Create Your First Course
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {courses.slice(0, 6).map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course._id}>
                    <CourseCard
                      course={{
                        id: course._id,
                        title: course.title,
                        imageUrl: course.thumbnail || "https://via.placeholder.com/400x200",
                        status: course.status || "draft",
                        price: course.price || 0,
                        description: course.description,
                        category: course.category,
                        adminFeedback: course.adminFeedback,
                      }}
                      showStatus={true}
                      getStatusChip={getStatusChip}
                      onEdit={() => navigate(`/tutor/courses/edit/${course._id}`)}
                      onSubmitReview={() => handleSubmitForReview(course._id)}
                      showSubmitButton={course.status === 'draft' || course.status === 'rejected'}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LibraryBooksIcon />}
                  onClick={() => navigate('/tutor/courses')}
                >
                  View All Courses
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PendingIcon />}
                  onClick={() => navigate('/tutor/courses?filter=pending')}
                >
                  Pending Reviews
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={() => navigate('/tutor/courses?filter=published')}
                >
                  Published Courses
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<WarningIcon />}
                  onClick={() => navigate('/tutor/courses?filter=rejected')}
                >
                  Rejected Courses
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;