// src/pages/tutor/EnrolledStudents.jsx
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Chip,
  Avatar,
  Stack,
  alpha,
  IconButton
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  FilterList,
  People,
  Email,
  CalendarToday,
  School,
  Download
} from "@mui/icons-material";

const EnrolledStudents = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [groupedEnrollments, setGroupedEnrollments] = useState({});
  const [selectedCourse, setSelectedCourse] = useState("All");

  // Group enrollments by course title
  const groupByCourse = (data) => {
    const grouped = {};
    data.forEach((enroll) => {
      const courseTitle = enroll.courseId?.title || "Untitled Course";
      if (!grouped[courseTitle]) {
        grouped[courseTitle] = [];
      }
      grouped[courseTitle].push(enroll);
    });
    return grouped;
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axiosInstance.get("/analytics/tutor/enrollments", {
          withCredentials: true,
        });
        const data = response.data.enrollments || [];
        setEnrollments(data);
        setGroupedEnrollments(groupByCourse(data));
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const CourseCard = ({ title, enrollments, course }) => (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha('#000', 0.1)}`,
        mb: 3,
        transition: '0.3s',
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      {/* Course Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${alpha('#000', 0.1)}`,
        bgcolor: alpha('#6a11cb', 0.03),
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}>
        {course?.thumbnail && (
          <Avatar
            src={course.thumbnail}
            variant="rounded"
            sx={{ 
              width: 80, 
              height: 80,
              borderRadius: 2,
              boxShadow: 2
            }}
          />
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {course?.title || title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<People />} 
              label={`${enrollments.length} students`}
              color="primary"
              variant="outlined"
              size="small"
            />
            {course?.category && (
              <Chip 
                label={course.category}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <IconButton>
          <Download />
        </IconButton>
      </Box>

      {/* Students Table */}
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha('#6a11cb', 0.02) }}>
            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Student</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Enrollment Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {enrollments.map((enroll, index) => (
            <TableRow 
              key={enroll._id}
              sx={{ 
                '&:hover': { bgcolor: alpha('#6a11cb', 0.01) },
                transition: '0.2s'
              }}
            >
              <TableCell sx={{ py: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  {index + 1}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.main',
                      fontSize: '0.8rem'
                    }}
                  >
                    {enroll.studentId?.name ? enroll.studentId.name.charAt(0).toUpperCase() : 'S'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {enroll.studentId?.name || "Anonymous Student"}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {enroll.studentId?.email || "N/A"}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {new Date(enroll.enrolledAt).toLocaleDateString()}
                  </Typography>
                </Box>
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
    </Paper>
  );

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Student Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track your enrolled students across all courses
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <People color="primary" />
            <Typography variant="h6" color="primary" fontWeight="bold">
              {enrollments.length} Total Students
            </Typography>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: alpha('#6a11cb', 0.05) }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {Object.keys(groupedEnrollments).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: alpha('#00c853', 0.05) }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {enrollments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Enrollments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Filter */}
          {Object.keys(groupedEnrollments).length > 1 && (
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <FilterList color="action" />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="course-filter-label">Filter by Course</InputLabel>
                <Select
                  labelId="course-filter-label"
                  value={selectedCourse}
                  label="Filter by Course"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <MenuItem value="All">All Courses</MenuItem>
                  {Object.keys(groupedEnrollments).map((title, idx) => (
                    <MenuItem key={idx} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                Showing {selectedCourse === "All" ? "all" : "1"} course(s)
              </Typography>
            </Paper>
          )}

          {/* Courses List */}
          {Object.entries(groupedEnrollments)
            .filter(([title]) => selectedCourse === "All" || selectedCourse === title)
            .map(([courseTitle, courseEnrollments], idx) => (
              <CourseCard
                key={idx}
                title={courseTitle}
                enrollments={courseEnrollments}
                course={courseEnrollments[0]?.courseId}
              />
            ))}

          {/* Empty State */}
          {Object.keys(groupedEnrollments).length === 0 && !loading && (
            <Paper 
              elevation={2} 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 3,
                bgcolor: alpha('#6a11cb', 0.02)
              }}
            >
              <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No students enrolled yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students will appear here once they enroll in your courses
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default EnrolledStudents;