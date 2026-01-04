// src/pages/Student/CourseLearn.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  PlayCircle,
  CheckCircle,
  Circle,
  ArrowBack,
  Description,
  VideoLibrary,
  Quiz,
  Assignment,
  LockOpen,
  Star,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

 // CourseLearn.jsx - Updated fetchCourseData
const fetchCourseData = async () => {
  try {
    setLoading(true);
    
    // 1. Get course details using student-specific endpoint
    const courseRes = await axiosInstance.get(`/students/course-details/${courseId}`);
    
    if (courseRes.data.success) {
      setCourse(courseRes.data.course);
      
      // Check if enrolled
      if (!courseRes.data.course.isEnrolled) {
        setError("You need to enroll in this course first");
        setLoading(false);
        return;
      }
      
      // If we have lessons in the response, use them
      if (courseRes.data.course.lessons && courseRes.data.course.lessons.length > 0) {
        setLessons(courseRes.data.course.lessons);
        setSelectedLesson(courseRes.data.course.lessons[0]);
      } else {
        // Otherwise fetch lessons separately
        const lessonsRes = await axiosInstance.get(`/students/course/${courseId}/lessons`);
        if (lessonsRes.data.success) {
          setLessons(lessonsRes.data.lessons);
          if (lessonsRes.data.lessons.length > 0) {
            setSelectedLesson(lessonsRes.data.lessons[0]);
          }
        }
      }
    } else {
      setError(courseRes.data.message || "Failed to load course");
    }

    // 2. Try to fetch progress (optional - might not exist yet)
    try {
      const progressRes = await axiosInstance.get(`/progress/${courseId}`);
      if (progressRes.data.success) {
        setUserProgress(progressRes.data.progress);
      }
    } catch (progressErr) {
      console.log('No progress data yet');
    }
    
  } catch (err) {
    console.error("Error fetching course data:", err.response?.data || err.message);
    
    if (err.response?.status === 403) {
      setError("You need to enroll in this course to access learning materials");
    } else if (err.response?.status === 404) {
      setError("Course not found");
    } else {
      setError("Failed to load course. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  const markLessonComplete = async (lessonId) => {
    try {
      const response = await axiosInstance.post(
        `/progress/${courseId}/lessons/${lessonId}/complete`
      );
      
      if (response.data.success) {
        // Update local progress
        setUserProgress(response.data.progress);
        
        // Show success message
        setMessage({ 
          type: 'success', 
          text: 'Lesson completed! 🎉' 
        });
        setTimeout(() => setMessage(null), 3000);
        
        // Auto-advance to next lesson if available
        const currentIndex = lessons.findIndex(l => l._id === lessonId);
        if (currentIndex < lessons.length - 1) {
          setTimeout(() => {
            setSelectedLesson(lessons[currentIndex + 1]);
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to mark lesson complete' 
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const isLessonCompleted = (lessonId) => {
    if (!userProgress || !userProgress.completedLessons) return false;
    return userProgress.completedLessons.some(
      cl => cl.lessonId?._id === lessonId || cl.lessonId === lessonId
    );
  };

  const getProgressPercentage = () => {
    if (!userProgress) return 0;
    return userProgress.progressPercentage || 0;
  };

  const getLessonIcon = (lesson, lessonId) => {
    if (isLessonCompleted(lessonId)) {
      return <CheckCircle color="success" />;
    }
    
    switch (lesson.type) {
      case 'video': return <VideoLibrary color="primary" />;
      case 'quiz': return <Quiz color="secondary" />;
      case 'assignment': return <Assignment color="warning" />;
      default: return <Description color="info" />;
    }
  };

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
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
      {/* Left Sidebar - Lessons */}
      <Paper sx={{ width: 320, flexShrink: 0, overflowY: "auto" }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {course?.title}
            </Typography>
          </Box>
          
          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Course Progress</Typography>
              <Typography variant="body2" fontWeight="bold">
                {getProgressPercentage()}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Lessons ({lessons.length})
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
          {lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson._id);
            const isSelected = selectedLesson?._id === lesson._id;
            
            return (
              <React.Fragment key={lesson._id}>
                <ListItem
                  button
                  selected={isSelected}
                  onClick={() => setSelectedLesson(lesson)}
                  sx={{
                    borderLeft: isSelected ? 4 : 0,
                    borderColor: "primary.main",
                    bgcolor: isSelected ? "action.selected" : "inherit",
                    py: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getLessonIcon(lesson, lesson._id)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="medium">
                        {index + 1}. {lesson.title}
                        {completed && (
                          <Chip 
                            label="Completed" 
                            size="small" 
                            color="success" 
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {lesson.type === 'video' ? 'Video' : 'Reading'} • {lesson.duration || '5 min'}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header with Progress */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {selectedLesson?.title}
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip 
              label={selectedLesson?.type || 'Lesson'} 
              color="primary" 
              size="small" 
            />
            <Typography variant="body2" color="text.secondary">
              Duration: {selectedLesson?.duration || '5 min'}
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary">
            {selectedLesson?.description}
          </Typography>
        </Paper>

        {/* Message Alert */}
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mx: 3, mt: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Lesson Content */}
        <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
          {selectedLesson?.type === 'video' ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Video Lesson
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedLesson.content || "Video content will play here."}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlayCircle />}
                  onClick={() => window.open(selectedLesson.contentUrl, '_blank')}
                >
                  Watch Video
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1" paragraph>
                {selectedLesson?.content || "Lesson content will appear here."}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Action Buttons */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => {
                const currentIndex = lessons.findIndex(l => l._id === selectedLesson?._id);
                if (currentIndex > 0) {
                  setSelectedLesson(lessons[currentIndex - 1]);
                }
              }}
              disabled={lessons.findIndex(l => l._id === selectedLesson?._id) === 0}
            >
              ← Previous
            </Button>
            
            <Box sx={{ display: "flex", gap: 2 }}>
              {!isLessonCompleted(selectedLesson?._id) && (
                <Button
                  variant="outlined"
                  onClick={() => markLessonComplete(selectedLesson?._id)}
                  startIcon={<CheckCircle />}
                >
                  Mark Complete
                </Button>
              )}
              
              <Button
                variant="contained"
                onClick={() => {
                  const currentIndex = lessons.findIndex(l => l._id === selectedLesson?._id);
                  if (currentIndex < lessons.length - 1) {
                    setSelectedLesson(lessons[currentIndex + 1]);
                  }
                }}
                disabled={lessons.findIndex(l => l._id === selectedLesson?._id) === lessons.length - 1}
              >
                Next Lesson →
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CourseLearn;