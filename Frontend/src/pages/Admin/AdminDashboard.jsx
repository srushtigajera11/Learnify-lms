import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Select,
  MenuItem,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
   Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
   Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  School,
  Person,
  CheckCircle,
  Pending,
  Payments,
  People,
} from "@mui/icons-material";

import StatCard from "./StatsCard";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingCourses, setPendingCourses] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState(0);



  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [courseRes, userRes, statsRes ,pendingRes, enrollmentRes, paymentRes] = await Promise.all([
        axiosInstance.get("/admin/courses"),
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/admin/stats"),
        axiosInstance.get("/admin/courses/pending"),
        axiosInstance.get('/admin/enrollments'),
        axiosInstance.get('/admin/payments'),
      ]);

      setCourses(courseRes.data);
      setUsers(userRes.data);
      setStats(statsRes.data);
      setPendingCourses(pendingRes.data);
      setEnrollments(enrollmentRes.data);
      setPayments(paymentRes.data);
    } catch (err) {
      setError("Failed to load admin dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/course/${courseId}/status`, {
        status: newStatus,
      });
      fetchAllData();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);
  const handleApprove = async (courseId) => {
  await axiosInstance.put(`/admin/course/${courseId}/approve`);
  fetchAllData();
};
const handleReject = async () => {
  await axiosInstance.put(
    `/admin/course/${selectedCourse._id}/reject`,
    { feedback }
  );

  setRejectModalOpen(false);
  setFeedback("");
  setSelectedCourse(null);
  fetchAllData();
};


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#1e3a8a" gutterBottom>
        🛠 Admin Dashboard
      </Typography>

      {/* ================= STATS SECTION ================= */}
      <Grid container spacing={3} mt={2} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<School />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Enrollments"
            value={stats.totalEnrollments}
            icon={<Person />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`₹${stats.totalRevenue}`}
            icon={<Payments />}
            color="#22c55e"
          />
        </Grid>
      </Grid>

<Typography variant="h5" color="primary" mb={3}>
  ⏳ Pending Course Approvals
</Typography>

{pendingCourses.length === 0 ? (
  <Typography>No pending courses 🎉</Typography>
) : (
  <Grid container spacing={3}>
    {pendingCourses.map((course) => (
      <Grid item xs={12} md={6} lg={4} key={course._id}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {course.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              Instructor: {course.createdBy?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Email: {course.createdBy?.email}
            </Typography>

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => handleApprove(course._id)}
              >
                Approve
              </Button>

              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => {
                  setSelectedCourse(course);
                  setRejectModalOpen(true);
                }}
              >
                Reject
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
)}
<Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
  <Tab label="📘 Enrollments" />
  <Tab label="💳 Payments" />
</Tabs>
{tab === 0 && (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Course</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Enrolled On</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {enrollments.map((enroll) => (
          <TableRow key={enroll._id}>
           <TableCell>{enroll.studentId?.name}</TableCell>
          <TableCell>{enroll.courseId?.title}</TableCell>
          <TableCell>{enroll.studentId?.email}</TableCell>
          <TableCell>
            {new Date(enroll.createdAt).toLocaleDateString()}
          </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}
{tab === 1 && (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Course</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Payment ID</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {payments.map((payment) => (
  <TableRow key={payment._id}>
    <TableCell>{payment.userId?.name}</TableCell>
    <TableCell>{payment.userId?.email}</TableCell>
    <TableCell>{payment.courseId?.title}</TableCell>
    <TableCell>₹{payment.amount}</TableCell>
    <TableCell>{payment.status}</TableCell>
    <TableCell>
      {new Date(payment.createdAt).toLocaleDateString()}
    </TableCell>
  </TableRow>
        ))}

      </TableBody>
    </Table>
  </TableContainer>
)}

      {/* ================= COURSES SECTION ================= */}
      <Typography variant="h5" color="primary" mb={3}>
        🎓 All Courses
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course._id}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {course.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={1}>
                  Created by:{" "}
                  <strong>{course.createdBy?.name || "Unknown"}</strong>
                </Typography>

                <Box mt={2}>
                  <Typography variant="body2">Status</Typography>
                  <Select
                    value={course.status}
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    onChange={(e) =>
                      handleStatusChange(course._id, e.target.value)
                    }
                  >
                    <MenuItem value="draft">
                      <Pending fontSize="small" sx={{ mr: 1 }} />
                      Draft
                    </MenuItem>
                    <MenuItem value="published">
                      <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                      Published
                    </MenuItem>
                  </Select>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= USERS SECTION ================= */}
      <Typography variant="h5" color="primary" mt={7} mb={3}>
        👥 All Users
      </Typography>

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user._id}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                p: 2,
                gap: 2,
              }}
            >
              <Avatar sx={{ bgcolor: "#1e3a8a" }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>

              <Box>
                <Typography fontWeight="bold">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>

                <Chip
                  size="small"
                  sx={{ mt: 1 }}
                  label={
                    user.isAdmin
                      ? "ADMIN"
                      : user.role?.toUpperCase() || "STUDENT"
                  }
                  color={user.isAdmin ? "error" : "info"}
                  variant="outlined"
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
  <DialogTitle>Reject Course</DialogTitle>

  <DialogContent>
    <Typography variant="body2" mb={1}>
      Provide feedback for the instructor
    </Typography>

    <TextField
      multiline
      rows={4}
      fullWidth
      value={feedback}
      onChange={(e) => setFeedback(e.target.value)}
      placeholder="Explain why the course was rejected..."
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setRejectModalOpen(false)}>Cancel</Button>
    <Button
      color="error"
      variant="contained"
      onClick={handleReject}
      disabled={!feedback}
    >
      Reject
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default AdminDashboard;
