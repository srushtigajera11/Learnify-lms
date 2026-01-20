import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    switch (lesson.type) {
      case 'video': return <VideoLibrary className="h-5 w-5 text-blue-500" />;
      case 'quiz': return <Quiz className="h-5 w-5 text-purple-500" />;
      case 'assignment': return <Assignment className="h-5 w-5 text-yellow-500" />;
      default: return <Description className="h-5 w-5 text-indigo-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Lessons */}
      <div className="w-80 flex-shrink-0 bg-white shadow-lg overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowBack className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-800 truncate">
              {course?.title}
            </h2>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Course Progress</span>
              <span className="font-semibold text-gray-800">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          <hr className="my-3" />
          
          <p className="text-sm text-gray-500 mb-2">
            Lessons ({lessons.length})
          </p>
        </div>
        
        {/* Lessons List */}
        <div className="pb-4">
          {lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson._id);
            const isSelected = selectedLesson?._id === lesson._id;
            
            return (
              <div key={lesson._id} className="border-b border-gray-100">
                <button
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getLessonIcon(lesson, lesson._id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {index + 1}. {lesson.title}
                      </span>
                      {completed && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {lesson.type === 'video' ? 'Video' : 'Reading'} • {lesson.duration || '5 min'}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Progress */}
        <div className="bg-white shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {selectedLesson?.title}
          </h1>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {selectedLesson?.type || 'Lesson'}
            </span>
            <span className="text-sm text-gray-500">
              Duration: {selectedLesson?.duration || '5 min'}
            </span>
          </div>
          
          <p className="text-gray-600">
            {selectedLesson?.description}
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Lesson Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedLesson?.type === 'video' ? (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Video Lesson
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedLesson.content || "Video content will play here."}
              </p>
              <button
                onClick={() => window.open(selectedLesson.contentUrl, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <PlayCircle className="h-5 w-5" />
                Watch Video
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="prose max-w-none">
                {selectedLesson?.content || "Lesson content will appear here."}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow-lg p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const currentIndex = lessons.findIndex(l => l._id === selectedLesson?._id);
                if (currentIndex > 0) {
                  setSelectedLesson(lessons[currentIndex - 1]);
                }
              }}
              disabled={lessons.findIndex(l => l._id === selectedLesson?._id) === 0}
              className={`px-4 py-2 rounded-lg ${
                lessons.findIndex(l => l._id === selectedLesson?._id) === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Previous
            </button>
            
            <div className="flex gap-3">
              {!isLessonCompleted(selectedLesson?._id) && (
                <button
                  onClick={() => markLessonComplete(selectedLesson?._id)}
                  className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark Complete
                </button>
              )}
              
              <button
                onClick={() => {
                  const currentIndex = lessons.findIndex(l => l._id === selectedLesson?._id);
                  if (currentIndex < lessons.length - 1) {
                    setSelectedLesson(lessons[currentIndex + 1]);
                  }
                }}
                disabled={lessons.findIndex(l => l._id === selectedLesson?._id) === lessons.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  lessons.findIndex(l => l._id === selectedLesson?._id) === lessons.length - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next Lesson →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearn;