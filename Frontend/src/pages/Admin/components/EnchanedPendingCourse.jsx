// frontend/src/pages/admin/components/EnhancedPendingCourses.jsx
import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  AccessTime,
  Person,
  MenuBook,
  Download
} from '@mui/icons-material';
import { approveCourse, rejectCourse } from '../services/adminApi';

const EnhancedPendingCourses = ({ courses, refresh }) => {
  const getCourseProgress = (course) => {
    // Calculate completion percentage
    const checks = [
      !!course.title,
      !!course.description,
      !!course.category,
      !!course.thumbnail,
      course.sections?.length > 0,
      course.totalLessons > 0
    ];
    
    const met = checks.filter(Boolean).length;
    return Math.round((met / checks.length) * 100);
  };

  const handleApprove = async (id) => {
    await approveCourse(id);
    refresh();
  };

  const handleReject = async (id, feedback) => {
    const feedbackText = prompt('Please provide rejection feedback:', 
      'Course needs improvement in content quality.');
    
    if (feedbackText) {
      await rejectCourse(id, feedbackText);
      refresh();
    }
  };

  const handlePreview = (courseId) => {
    // Open course preview in new tab
    window.open(`/course/preview/${courseId}`, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          ⏳ Pending Course Reviews ({courses.length})
        </Typography>
        <Chip 
          label={`${courses.length} waiting`} 
          color="warning" 
          size="small" 
        />
      </Box>

      <Grid container spacing={2}>
        {courses.map((course) => {
          const progress = getCourseProgress(course);
          
          return (
            <Grid item xs={12} key={course._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        By: {course.createdBy?.name || 'Unknown Instructor'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Submitted: {new Date(course.createdAt).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={`${course.totalLessons || 0} lessons`} 
                        size="small" 
                        icon={<MenuBook />}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Completion</Typography>
                      <Typography variant="caption">{progress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      color={progress > 70 ? "success" : progress > 40 ? "warning" : "error"}
                    />
                  </Box>

                  {/* Quick Stats */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item>
                      <Chip 
                        size="small"
                        label={course.category || 'Uncategorized'}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item>
                      <Chip 
                        size="small"
                        label={`$${course.price || 0}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item>
                      <Chip 
                        size="small"
                        icon={<AccessTime />}
                        label={`${Math.round(course.duration || 0)} min`}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {course.description?.substring(0, 150)}...
                  </Typography>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handlePreview(course._id)}
                    >
                      Preview
                    </Button>
                    
                    {/* Quick Stats Button */}
                    <Tooltip title="View course statistics">
                      <IconButton size="small">
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleReject(course._id)}
                      sx={{ mr: 1 }}
                    >
                      Reject
                    </Button>
                    
                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApprove(course._id)}
                    >
                      Approve
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}

        {courses.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No pending course reviews
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All courses have been reviewed
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EnhancedPendingCourses;