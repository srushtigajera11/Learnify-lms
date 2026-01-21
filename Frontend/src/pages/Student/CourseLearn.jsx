import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  Lock,
  VideoLibrary,
  Quiz,
  Description,
  ArrowForward,
  ArrowBack as ArrowBackIcon,
  Download,
  PictureAsPdf,
  Link as LinkIcon,
  PlayCircle,
  PauseCircle,
  Speed,
  Menu
} from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";
import ReactPlayer from 'react-player';

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Get course details with lessons
      const courseRes = await axiosInstance.get(`/students/course-details/${courseId}`);
      
      if (!courseRes.data.success || !courseRes.data.course.isEnrolled) {
        setError("You must enroll in this course first");
        return;
      }

      setCourse(courseRes.data.course);
      setLessons(courseRes.data.course.lessons || []);

      // Get completed lessons
      const progressRes = await axiosInstance.get(`/progress/${courseId}`);
      const completed = new Set(
        progressRes.data.progress?.completedLessons?.map(p => 
          p.lessonId?._id || p.lessonId
        ) || []
      );
      setCompletedLessons(completed);

      // Load first lesson content
      if (courseRes.data.course.lessons?.length > 0) {
        await loadLessonContent(courseRes.data.course.lessons[0]._id);
      }

    } catch (err) {
      console.error("Error loading course:", err);
      setError("Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  const loadLessonContent = async (lessonId) => {
    try {
      // Try the new endpoint if available
      const response = await axiosInstance.get(`/students/course/${courseId}/lesson/${lessonId}`);
      
      if (response.data.success) {
        setCurrentLesson(response.data.lesson);
      } else {
        // Fallback to basic lesson data
        const lesson = lessons.find(l => l._id === lessonId);
        if (lesson) {
          setCurrentLesson({
            ...lesson,
            isCompleted: completedLessons.has(lessonId),
            previousLesson: null,
            nextLesson: null
          });
        }
      }
    } catch (err) {
      console.error("Error loading lesson:", err);
      // Use basic lesson data as fallback
      const lesson = lessons.find(l => l._id === lessonId);
      if (lesson) {
        setCurrentLesson({
          ...lesson,
          isCompleted: completedLessons.has(lessonId),
          previousLesson: null,
          nextLesson: null
        });
      }
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      await axiosInstance.post(`/progress/${courseId}/lessons/${currentLesson._id}/complete`);
      
      // Update local state
      setCompletedLessons(prev => new Set([...prev, currentLesson._id]));
      setCurrentLesson(prev => ({ ...prev, isCompleted: true }));

      // Auto-navigate to next lesson if available
      if (currentLesson.nextLesson) {
        setTimeout(() => {
          loadLessonContent(currentLesson.nextLesson._id);
        }, 1000);
      }

    } catch (err) {
      alert("Failed to mark lesson complete");
    }
  };

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.lessonType) {
      case 'video':
        return renderVideoContent();
      case 'text':
        return renderTextContent();
      case 'quiz':
        return renderQuizContent();
      default:
        return renderDefaultContent();
    }
  };

  const renderVideoContent = () => {
    // Find video material
    const videoMaterial = currentLesson.materials?.find(m => 
      m.type === 'video' || m.url?.includes('youtube') || m.url?.includes('vimeo')
    );

    if (videoMaterial?.url) {
      return (
        <div className="bg-black rounded-xl overflow-hidden">
          <div className="relative pt-[56.25%]">
            <ReactPlayer
              url={videoMaterial.url}
              controls
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
              playing={videoPlaying}
              playbackRate={playbackRate}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              config={{
                youtube: {
                  playerVars: { showinfo: 1 }
                }
              }}
            />
          </div>
          <div className="p-4 bg-gray-900 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setVideoPlaying(!videoPlaying)}
                className="flex items-center text-white hover:text-yellow-400"
              >
                {videoPlaying ? <PauseCircle /> : <PlayCircle />}
                <span className="ml-2">{videoPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>
            <div className="flex items-center">
              <Speed className="h-5 w-5 mr-2 text-white" />
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-gray-800 text-white px-2 py-1 rounded"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <option key={rate} value={rate}>{rate}x</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <VideoLibrary className="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Video Lesson</h3>
        <p className="text-gray-600 mb-4">
          {currentLesson.description || "This is a video lesson. The video content will appear here."}
        </p>
        <div className="bg-gray-200 p-4 rounded-lg">
          <p className="text-sm text-gray-500">
            Video URL not configured. Add video materials in the lesson settings.
          </p>
        </div>
      </div>
    );
  };

  const renderTextContent = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="prose max-w-none">
          {currentLesson.content ? (
            <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
              <div className="text-gray-600 whitespace-pre-line">
                {currentLesson.description || "This is a text lesson. The content will appear here."}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderQuizContent = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="text-center py-8">
          <Quiz className="h-24 w-24 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz: {currentLesson.title}</h3>
          <p className="text-gray-600 mb-6">
            {currentLesson.description || "Test your knowledge with this quiz."}
          </p>
          <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Start Quiz
          </button>
        </div>
      </div>
    );
  };

  const renderDefaultContent = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="text-center py-8">
          <Description className="h-24 w-24 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentLesson.title}</h3>
          <div className="text-gray-600 whitespace-pre-line mb-6">
            {currentLesson.description || "Lesson content will appear here."}
          </div>
          
          {/* Show materials if available */}
          {currentLesson.materials && currentLesson.materials.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Lesson Materials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentLesson.materials.map((material, idx) => (
                  <a
                    key={idx}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                      {material.type === 'pdf' ? (
                        <PictureAsPdf />
                      ) : material.type === 'link' ? (
                        <LinkIcon />
                      ) : (
                        <Download />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{material.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{material.type}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLessonIcon = (lesson) => {
    if (completedLessons.has(lesson._id)) {
      return <CheckCircle className="text-green-500" />;
    }

    switch (lesson.lessonType) {
      case 'video':
        return <VideoLibrary className="text-blue-500" />;
      case 'quiz':
        return <Quiz className="text-purple-500" />;
      case 'text':
        return <Description className="text-gray-500" />;
      default:
        return <Description className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-red-600 text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Unable to load course</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate("/student/mylearning")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l._id === currentLesson?._id);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-3 lg:hidden"
            >
              {sidebarOpen ? <Menu /> : <Menu />}
            </button>
            <button
              onClick={() => navigate("/student/mylearning")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowBackIcon className="h-5 w-5 mr-2" />
              Back to Courses
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <span className="text-sm text-gray-500">Course:</span>
              <span className="ml-2 font-semibold">{course?.title}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed lg:relative lg:translate-x-0
          w-80 bg-white shadow-lg h-full overflow-y-auto
          transition-transform duration-300 z-20
        `}>
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg truncate">{course?.title}</h2>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {Array.from(completedLessons).length} of {lessons.length} lessons
              </span>
            </div>
          </div>

          <div className="p-2">
            {lessons.map((lesson, index) => (
              <button
                key={lesson._id}
                onClick={() => loadLessonContent(lesson._id)}
                className={`
                  w-full px-4 py-3 flex items-start gap-3 text-left rounded-lg mb-1
                  transition-all duration-200
                  ${currentLesson?._id === lesson._id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className="pt-1">
                  {renderLessonIcon(lesson)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {index + 1}. {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="truncate">{lesson.lessonType || 'lesson'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {currentLesson ? (
            <>
              {/* Lesson Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {currentLesson.title}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Lesson {currentIndex + 1} of {lessons.length}
                    </p>
                  </div>
                  {!currentLesson.isCompleted && (
                    <button
                      onClick={markLessonComplete}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Mark Complete
                    </button>
                  )}
                </div>
                <p className="text-gray-700">{currentLesson.description}</p>
              </div>

              {/* Lesson Content */}
              <div className="mb-8">
                {renderLessonContent()}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  onClick={() => currentIndex > 0 && loadLessonContent(lessons[currentIndex - 1]._id)}
                  disabled={currentIndex === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                    currentIndex > 0
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowBack className="h-5 w-5" />
                  Previous
                </button>

                <button
                  onClick={() => currentIndex < lessons.length - 1 && loadLessonContent(lessons[currentIndex + 1]._id)}
                  disabled={currentIndex >= lessons.length - 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                    currentIndex < lessons.length - 1
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next Lesson
                  <ArrowForward className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Select a lesson to begin learning</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearn;