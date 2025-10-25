// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import {
  Box, Typography, Button, Accordion, AccordionSummary,
  AccordionDetails, CircularProgress, Alert, LinearProgress, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [certified, setCertified] = useState(false);

  // Fetch course and lessons
  const fetchCourseDetails = async () => {
    try {
      const { data } = await axiosInstance.get(`/courses/${courseId}`);
      setCourse(data.course);
      setLessons(data.lessons);
    } catch (err) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved progress
  const fetchProgress = async () => {
    try {
      const { data } = await axiosInstance.get(`/progress/${courseId}`);
      setProgress(data.completedLessons || []);
    } catch (err) {
      console.error('Failed to fetch progress', err);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    fetchProgress();
  }, [courseId]);

  // Handle lesson complete
  const handleMarkComplete = async (lessonId) => {
    try {
      await axiosInstance.post(`/progress/${courseId}/${lessonId}`);
      setProgress((prev) => [...prev, lessonId]);
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    }
  };

  const totalLessons = lessons.length;
  const completedLessons = progress.length;
  const isCourseCompleted = totalLessons > 0 && completedLessons >= totalLessons;

  useEffect(() => {
    if (isCourseCompleted) {
      setCertified(true);
    }
  }, [completedLessons, totalLessons]);

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

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Course Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {course.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {course.description}
      </Typography>

      {/* Progress */}
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Progress: {completedLessons} / {totalLessons} lessons
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(completedLessons / totalLessons) * 100}
          sx={{ height: 10, borderRadius: 5 }}
        />
        {isCourseCompleted && (
          <Chip
            icon={<CheckCircleIcon />}
            label="Course Completed - Certificate Earned"
            color="success"
            size="medium"
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      {/* Lessons */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Course Content
      </Typography>

      {lessons.map((lesson) => {
        const isLessonCompleted = progress.includes(lesson._id);
        return (
          <Accordion key={lesson._id} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                {lesson.title}
              </Typography>
              {isLessonCompleted && (
                <Chip label="Completed" size="small" color="success" sx={{ ml: 2 }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {lesson.description}
              </Typography>

              {lesson.materials.map((material, index) => (
                <Button
                  key={index}
                  variant="contained"
                  color="primary"
                  startIcon={
                    material.type === 'video' ? <VideoLibraryIcon /> : <DescriptionIcon />
                  }
                  href={material.url}
                  target="_blank"
                  sx={{ mr: 2, mb: 1 }}
                >
                  {material.type === 'video' ? 'Watch Video' : 'Open Document'}
                </Button>
              ))}

              {!isLessonCompleted && (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => handleMarkComplete(lesson._id)}
                >
                  Mark as Completed
                </Button>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default CourseDetail;
