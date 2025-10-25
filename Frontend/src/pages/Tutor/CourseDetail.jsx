import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add,
  List,
  Quiz,
  Assignment,
  School,
  BarChart,
  Edit,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/courses/my-course/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!course) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Course not found
      </Alert>
    );
  }

  const managementCards = [
    {
      title: 'Lessons',
      description: 'Manage course lessons and content',
      icon: <List color="primary" />,
      actions: [
        {
          label: 'View Lessons',
          onClick: () => navigate(`/tutor/course/${courseId}/lessons`),
          variant: 'outlined',
        },
        {
          label: 'Add Lesson',
          onClick: () => navigate(`/tutor/course/${courseId}/lessons/add`),
          variant: 'contained',
          startIcon: <Add />,
        },
      ],
    },
    {
      title: 'Quizzes',
      description: 'Create and manage quizzes',
      icon: <Quiz color="secondary" />,
      actions: [
        {
          label: 'View Quizzes',
          onClick: () => navigate(`/tutor/course/${courseId}/quizzes`),
          variant: 'outlined',
        },
        {
          label: 'Create Quiz',
          onClick: () => navigate(`/tutor/course/${courseId}/quizzes/create`),
          variant: 'contained',
          startIcon: <Add />,
        },
      ],
    },
    {
      title: 'Assignments',
      description: 'Manage student assignments',
      icon: <Assignment color="success" />,
      actions: [
        {
          label: 'View Assignments',
          onClick: () => navigate(`/tutor/course/${courseId}/assignments`),
          variant: 'outlined',
        },
        {
          label: 'Create Assignment',
          onClick: () => navigate(`/tutor/course/${courseId}/assignments/create`),
          variant: 'contained',
          startIcon: <Add />,
        },
      ],
    },
    {
      title: 'Students',
      description: 'View enrolled students and progress',
      icon: <School color="info" />,
      actions: [
        {
          label: 'View Students',
          onClick: () => navigate(`/tutor/course/${courseId}/students`),
          variant: 'contained',
        },
      ],
    },
    {
      title: 'Analytics',
      description: 'Course performance and insights',
      icon: <BarChart color="warning" />,
      actions: [
        {
          label: 'View Analytics',
          onClick: () => navigate(`/tutor/course/${courseId}/analytics`),
          variant: 'contained',
        },
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {course.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <Chip
                label={course.status?.toUpperCase()}
                color={course.status === 'published' ? 'success' : 'default'}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {course.category} • ₹{course.price || 'Free'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/tutor/course/${courseId}/edit`)}
          >
            Edit Course
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          {course.description}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Management Cards Grid */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Course Management
      </Typography>
      
      <Grid container spacing={3}>
        {managementCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {card.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                  {card.description}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {card.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant={action.variant}
                      onClick={action.onClick}
                      startIcon={action.startIcon}
                      fullWidth
                      size="small"
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats Section (Optional) */}
      <Card sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Stats
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Total Lessons
            </Typography>
            <Typography variant="h6" color="primary">
              0
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Enrolled Students
            </Typography>
            <Typography variant="h6" color="primary">
              0
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Completion Rate
            </Typography>
            <Typography variant="h6" color="primary">
              0%
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Average Rating
            </Typography>
            <Typography variant="h6" color="primary">
              ⭐ 0.0
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}