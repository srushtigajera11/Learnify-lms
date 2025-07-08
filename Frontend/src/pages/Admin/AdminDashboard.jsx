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
  Divider,
  Paper,
  Chip,
  Tooltip,
} from "@mui/material";
import { School, Person, CheckCircle, Pending } from "@mui/icons-material";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    try {
      const [courseRes, userRes] = await Promise.all([
        axiosInstance.get("/admin/courses"),
        axiosInstance.get("/admin/users"),
      ]);
      setCourses(courseRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/course/${courseId}/status`, {
        status: newStatus,
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update course status", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#1e3a8a">
        🛠 Admin Dashboard
      </Typography>

      {/* Courses Section */}
      <Typography variant="h5" mt={5} mb={3} color="primary">
        🎓 All Courses
      </Typography>
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course._id}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {course.title}
                </Typography>
                <Typography variant="body2" gutterBottom color="text.secondary">
                  Created by:{" "}
                  <strong>{course.createdBy?.name || "Unknown"}</strong>
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Status:
                  </Typography>
                  <Select
                    value={course.status}
                    onChange={(e) =>
                      handleStatusChange(course._id, e.target.value)
                    }
                    size="small"
                    fullWidth
                    sx={{ mt: 1, borderRadius: 2 }}
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

      {/* Users Section */}
      <Typography variant="h5" mt={7} mb={3} color="primary">
        👥 All Users
      </Typography>
      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user._id}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                p: 2,
                gap: 2,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.02)" },
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
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={
                      user.isAdmin ? "👑 Admin" : user.role?.toUpperCase()
                    }
                    color={user.isAdmin ? "error" : "info"}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
