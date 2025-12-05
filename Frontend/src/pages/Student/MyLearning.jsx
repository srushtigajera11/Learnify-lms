// src/pages/Student/MyLearning.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  LinearProgress,
  Button,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import { PlayArrow, CheckCircle, AccessTime } from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const MyLearning = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/students/ecourses");
      if (response.data.success) {
        setEnrolledCourses(response.data.enrollments);
      }
    } catch (err) {
      setError("Failed to fetch enrolled courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (enrollment) => {
    if (!enrollment.progress || enrollment.progress.length === 0) return 0;
    const completedLessons = enrollment.progress.filter(
      (p) => p.completed
    ).length;
    const totalLessons = enrollment.courseId?.totalLessons || 0;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const handleContinueLearning = (courseId) => {
    navigate(`/student/course/${courseId}/learn`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  const filteredCourses = enrolledCourses.filter((enrollment) => {
    const progress = calculateProgress(enrollment);
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return progress > 0 && progress < 100; // In Progress
    if (activeTab === 2) return progress === 100; // Completed
    if (activeTab === 3) return progress === 0; // Not Started
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 5 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Learning
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 4 }}
      >
        <Tab label="All Courses" />
        <Tab label="In Progress" />
        <Tab label="Completed" />
        <Tab label="Not Started" />
      </Tabs>

      {filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <Typography variant="h6" color="text.secondary">
            {activeTab === 0
              ? "You haven't enrolled in any courses yet."
              : "No courses match this filter."}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate("/student/dashboard")}
          >
            Browse Courses
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((enrollment) => {
            const course = enrollment.courseId;
            const progress = calculateProgress(enrollment);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={enrollment._id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={course.thumbnail || "/default-course.jpg"}
                    alt={course.title}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {course.description?.substring(0, 100)}...
                    </Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Instructor: {course.createdBy?.name || "Unknown"}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {progress === 100 && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Completed"
                          color="success"
                          size="small"
                        />
                      )}
                      {progress > 0 && progress < 100 && (
                        <Chip
                          icon={<AccessTime />}
                          label="In Progress"
                          color="warning"
                          size="small"
                        />
                      )}
                      {progress === 0 && (
                        <Chip label="Not Started" color="default" size="small" />
                      )}
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      fullWidth
                      onClick={() => handleContinueLearning(course._id)}
                    >
                      {progress === 0 ? "Start Learning" : "Continue"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleViewCourse(course._id)}
                    >
                      View
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MyLearning;