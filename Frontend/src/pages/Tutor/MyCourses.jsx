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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Add,
  Category,
  MonetizationOn,
  Person,
} from '@mui/icons-material';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
  const navigate = useNavigate();

  const handleDeleteClick = (course) => {
    setDeleteDialog({ open: true, course });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.course) return;

    try {
      await axiosInstance.delete(`/courses/${deleteDialog.course._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== deleteDialog.course._id));
      setDeleteDialog({ open: false, course: null });
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, course: null });
  };

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

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          My Courses ({courses.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tutor/create-course')}
        >
          Create New Course
        </Button>
      </Box>

      {courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't created any courses yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tutor/create-course')}
            sx={{ mt: 2 }}
          >
            Create Your First Course
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                {/* Thumbnail */}
                <Box sx={{ height: 160, overflow: 'hidden' }}>
                  {course.thumbnail ? (
                    <CardMedia
                      component="img"
                      image={course.thumbnail}
                      alt={course.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.100',
                        color: 'grey.500',
                      }}
                    >
                      <Typography variant="body2">No Thumbnail</Typography>
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Status Chip */}
                  <Box sx={{ mb: 1.5 }}>
                    <Chip
                      label={course.status?.toUpperCase() || 'DRAFT'}
                      color={course.status === 'published' ? 'success' : 'default'}
                      size="small"
                      variant={course.status === 'published' ? 'filled' : 'outlined'}
                    />
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '3rem',
                    }}
                  >
                    {course.title || 'Untitled Course'}
                  </Typography>

                  {/* Course Details */}
                  <Stack spacing={1} sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {course.category || 'Uncategorized'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonetizationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {course.price > 0 ? `₹${course.price.toFixed(2)}` : 'Free'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {course.createdBy?.name || 'You'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                {/* Actions */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Tooltip title="View Course">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/tutor/course/${course._id}`)}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {/* <Tooltip title="Edit Course">
                      <IconButton
                        color="secondary"
                        onClick={() => navigate(`/tutor/course/${course._id}/edit`)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip> */}

                    <Tooltip title="Delete Course">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(course)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.course?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCourses;