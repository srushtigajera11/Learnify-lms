import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Box,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this course?');
    if (!confirmDelete) return;

    try {
      const res = await axiosInstance.delete(`/courses/${courseId}`);
      alert(res.data.message);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/courses/my-course');
        if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
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

  if (courses.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 5 }}>
        No courses available at the moment.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        My Courses
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    
    <Box sx={{ height: 160, overflow: 'hidden' }}>
  {course.thumbnail ? (
    <CardMedia
      component="img"
      image={course.thumbnail}
      alt={course.title}
      sx={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  ) : (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#888',
        fontSize: 18,
      }}
    >
      No Image
    </Box>
  )}
    </Box>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom noWrap>
        {course.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {course.description}
      </Typography>
      <Chip
        label={course.status || 'draft'}
        color={course.status === 'published' ? 'success' : 'warning'}
        size="small"
        sx={{ mb: 1 }}
      />
      <Typography variant="body2">
        <strong>Category:</strong> {course.category || 'N/A'}
      </Typography>
      <Typography variant="body2">
        <strong>Price:</strong> ₹{course.price?.toFixed(2) || 'Free'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <strong>By:</strong> {course.createdBy?.name || 'Unknown'}
      </Typography>
    </CardContent>

    <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, mt: 'auto' }}>
      <Button
        variant="outlined"
        onClick={() => navigate(`/tutor/course/${course._id}`)}
      >
        View
      </Button>
      <Button
        variant="contained"
        onClick={() => navigate(`/tutor/course/${course._id}/edit`)}
        color="primary"
      >
        Edit
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => handleDelete(course._id)}
      >
        Delete
      </Button>
    </Stack>
  </Card>
</Grid>

        ))}
      </Grid>
    </Box>
  );
};

export default MyCourses;
