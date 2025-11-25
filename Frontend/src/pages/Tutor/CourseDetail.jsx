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
  School,
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
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {course.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
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
            sx={{ minWidth: 140 }}
          >
            Edit Course
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {course.description}
        </Typography>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Management Cards Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          Course Management
        </Typography>
        
        <Grid container spacing={4}>
          {managementCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: '0.3s',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 8,
                  }
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  p: 3 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h6" component="h3" fontWeight="600">
                      {card.title}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 4, 
                      flexGrow: 1,
                      lineHeight: 1.5
                    }}
                  >
                    {card.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {card.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant}
                        onClick={action.onClick}
                        startIcon={action.startIcon}
                        fullWidth
                        size="medium"
                        sx={{ 
                          py: 1,
                          borderRadius: 2
                        }}
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
      </Box>

      {/* Empty space for better visual balance */}
      <Box sx={{ height: 40 }} />
    </Box>
  );
}