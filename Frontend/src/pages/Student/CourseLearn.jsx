import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  VideoLibrary,
  Quiz,
  Description,
  ArrowForward,
  Download,
  PictureAsPdf,
  Link as LinkIcon,
  PlayCircle,
  PauseCircle,
  Speed,
  Menu,
  Article,
  InsertDriveFile
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
  const [progress, setProgress] = useState({ percentage: 0, completed: 0, total: 0 });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

// In CourseLearn.jsx - Update all API calls:

const loadCourseData = async () => {
  try {
    setLoading(true);
    
    // Get course details - This seems to work (no 404)
    const courseRes = await axiosInstance.get(`/students/course-details/${courseId}`);
    
    if (!courseRes.data.success) {
      setError("Failed to load course");
      return;
    }

    if (!courseRes.data.course.isEnrolled) {
      setError("You must enroll in this course first");
      return;
    }

    setCourse(courseRes.data.course);

    // Get all lessons - FIXED PATH
    const lessonsRes = await axiosInstance.get(`/students/courses/${courseId}/lessons`);
    if (lessonsRes.data.success) {
      setLessons(lessonsRes.data.lessons || []);
      
      // Set completed lessons
      const completed = new Set(
        lessonsRes.data.lessons
          .filter(lesson => lesson.isCompleted)
          .map(lesson => lesson._id)
      );
      setCompletedLessons(completed);
      
      // Load first lesson if available
      if (lessonsRes.data.lessons.length > 0) {
        await loadLessonContent(lessonsRes.data.lessons[0]._id);
      }
    }

    // Get progress - FIXED PATH
    const progressRes = await axiosInstance.get(`/students/courses/${courseId}/progress`);
    if (progressRes.data.success) {
      setProgress({
        percentage: progressRes.data.progress.percentage,
        completed: progressRes.data.progress.completedLessons,
        total: progressRes.data.progress.totalLessons
      });
    }

  } catch (err) {
    console.error("Error loading course:", err);
    console.error("Error details:", err.response?.data);
    setError(err.response?.data?.message || "Failed to load course content");
  } finally {
    setLoading(false);
  }
};

const loadLessonContent = async (lessonId) => {
  try {
    setLoading(true);
    
    // FIXED PATH
    const response = await axiosInstance.get(`/students/courses/${courseId}/lessons/${lessonId}`);
    
    if (response.data.success) {
      setCurrentLesson(response.data.lesson);
    } else {
      // Fallback to basic lesson data from local state
      const lesson = lessons.find(l => l._id === lessonId);
      if (lesson) {
        setCurrentLesson({
          ...lesson,
          isCompleted: completedLessons.has(lessonId)
        });
      }
    }
  } catch (err) {
    console.error("Error loading lesson:", err);
    console.error("Error response:", err.response?.data);
    // Fallback to basic lesson data
    const lesson = lessons.find(l => l._id === lessonId);
    if (lesson) {
      setCurrentLesson({
        ...lesson,
        isCompleted: completedLessons.has(lessonId)
      });
    }
  } finally {
    setLoading(false);
  }
};

const markLessonComplete = async () => {
  if (!currentLesson || currentLesson.isCompleted) return;

  try {
    // FIXED PATH
    const response = await axiosInstance.post(
      `/students/courses/${courseId}/lessons/${currentLesson._id}/complete`
    );
    
    if (response.data.success) {
      // Update local state
      setCompletedLessons(prev => new Set([...prev, currentLesson._id]));
      setCurrentLesson(prev => ({ ...prev, isCompleted: true }));
      setProgress(prev => ({
        ...prev,
        percentage: response.data.progress.percentage,
        completed: response.data.progress.completedLessons
      }));

      // Auto-navigate to next lesson if available
      if (currentLesson.navigation?.nextLesson) {
        setTimeout(() => {
          loadLessonContent(currentLesson.navigation.nextLesson._id);
        }, 1500);
      }
    }
  } catch (err) {
    console.error("Failed to mark lesson complete:", err);
    console.error("Error response:", err.response?.data);
    alert("Failed to mark lesson complete. Please try again.");
  }
};
  const getLessonType = (lesson) => {
    if (lesson.lessonType) return lesson.lessonType;
    
    // Auto-detect based on materials
    if (lesson.materials && lesson.materials.length > 0) {
      const hasVideo = lesson.materials.some(m => 
        m.type === 'video' || m.url?.includes('youtube') || m.url?.includes('vimeo')
      );
      if (hasVideo) return 'video';
      
      const hasDocument = lesson.materials.some(m => 
        m.type === 'document' || m.type === 'pdf'
      );
      if (hasDocument) return 'document';
    }
    
    // Default based on content
    if (lesson.content && lesson.content.trim().length > 0) return 'text';
    if (lesson.description && lesson.description.trim().length > 0) return 'text';
    
    return 'document';
  };

  const renderVideoContent = () => {
    // Find video materials
    const videoMaterials = currentLesson.materials?.filter(m => 
      m.type === 'video' || m.url?.includes('youtube') || m.url?.includes('vimeo')
    );

    if (videoMaterials && videoMaterials.length > 0) {
      return (
        <div className="space-y-6">
          <div className="bg-black rounded-xl overflow-hidden">
            <div className="relative pt-[56.25%]">
              <ReactPlayer
                url={videoMaterials[0].url}
                controls
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
                playing={videoPlaying}
                playbackRate={playbackRate}
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={() => {
                  setVideoPlaying(false);
                  // Auto-mark complete when video ends
                  if (!currentLesson.isCompleted) {
                    markLessonComplete();
                  }
                }}
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
                  className="flex items-center text-white hover:text-yellow-400 transition-colors"
                >
                  {videoPlaying ? <PauseCircle fontSize="large" /> : <PlayCircle fontSize="large" />}
                  <span className="ml-2">{videoPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Speed className="mr-2 text-white" />
                  <select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    className="bg-gray-800 text-white px-3 py-1 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <option key={rate} value={rate}>{rate}x</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Video description and content */}
          {(currentLesson.description || currentLesson.content) && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">About this video</h3>
              <div className="prose max-w-none text-gray-700">
                {currentLesson.content ? (
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                ) : (
                  <p className="whitespace-pre-line">{currentLesson.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Additional materials */}
          {currentLesson.materials && currentLesson.materials.length > 1 && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentLesson.materials.slice(1).map((material, idx) => (
                  <a
                    key={idx}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                      {material.type === 'document' || material.type === 'pdf' ? (
                        <InsertDriveFile />
                      ) : material.type === 'link' ? (
                        <LinkIcon />
                      ) : material.type === 'video' ? (
                        <VideoLibrary />
                      ) : (
                        <Article />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{material.name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {material.description || material.type}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <VideoLibrary className="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Video Lesson</h3>
        <p className="text-gray-600 mb-4">
          {currentLesson.description || "This is a video lesson. Video content will appear here."}
        </p>
        <div className="bg-gray-200 p-4 rounded-lg inline-block">
          <p className="text-sm text-gray-500">
            No video materials configured for this lesson.
          </p>
        </div>
      </div>
    );
  };

  const renderTextContent = () => {
    const hasContent = currentLesson.content && currentLesson.content.trim().length > 0;
    const hasDescription = currentLesson.description && currentLesson.description.trim().length > 0;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="prose max-w-none">
            {hasContent ? (
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            ) : hasDescription ? (
              <>
                <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {currentLesson.description}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Description className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Text Lesson</h3>
                <p className="text-gray-600">
                  No content available for this lesson.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Materials section */}
        {currentLesson.materials && currentLesson.materials.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-xl font-semibold mb-4">Lesson Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentLesson.materials.map((material, idx) => (
                <a
                  key={idx}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                    {material.type === 'pdf' ? (
                      <PictureAsPdf />
                    ) : material.type === 'document' ? (
                      <InsertDriveFile />
                    ) : material.type === 'link' ? (
                      <LinkIcon />
                    ) : material.type === 'video' ? (
                      <VideoLibrary />
                    ) : (
                      <Article />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{material.name}</p>
                    <p className="text-sm text-gray-500">
                      {material.description || material.type}
                    </p>
                  </div>
                  <Download className="text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuizContent = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="text-center py-8">
          <Quiz className="h-24 w-24 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz: {currentLesson.title}</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {currentLesson.description || "Test your knowledge with this quiz. Complete it to mark this lesson as finished."}
          </p>
          <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors shadow-md hover:shadow-lg">
            Start Quiz
          </button>
        </div>
      </div>
    );
  };

  const renderDocumentContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
            {currentLesson.description && (
              <div className="text-gray-700 mb-6">
                <p className="whitespace-pre-line">{currentLesson.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents section */}
        {currentLesson.materials && currentLesson.materials.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-xl font-semibold mb-4">Documents & Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentLesson.materials.map((material, idx) => (
                <a
                  key={idx}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 text-center"
                >
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
                    {material.type === 'pdf' ? (
                      <PictureAsPdf className="h-8 w-8" />
                    ) : material.type === 'document' ? (
                      <InsertDriveFile className="h-8 w-8" />
                    ) : (
                      <Article className="h-8 w-8" />
                    )}
                  </div>
                  <p className="font-medium text-gray-900 mb-2">{material.name}</p>
                  {material.description && (
                    <p className="text-sm text-gray-500 mb-3">{material.description}</p>
                  )}
                  <span className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
                    {material.type.toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    const lessonType = getLessonType(currentLesson);

    switch (lessonType) {
      case 'video':
        return renderVideoContent();
      case 'text':
        return renderTextContent();
      case 'quiz':
        return renderQuizContent();
      case 'document':
        return renderDocumentContent();
      default:
        return renderTextContent();
    }
  };

  const renderLessonIcon = (lesson) => {
    if (completedLessons.has(lesson._id)) {
      return <CheckCircle className="text-green-500" />;
    }

    const lessonType = getLessonType(lesson);
    
    switch (lessonType) {
      case 'video':
        return <VideoLibrary className="text-blue-500" />;
      case 'quiz':
        return <Quiz className="text-purple-500" />;
      case 'document':
        return <InsertDriveFile className="text-yellow-500" />;
      default:
        return <Description className="text-gray-500" />;
    }
  };

  if (loading && !currentLesson) {
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
        <div className="text-center max-w-md">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">Unable to load course</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate("/student/mylearning")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = currentLesson?.navigation?.currentIndex || 0;
  const totalLessons = currentLesson?.navigation?.totalLessons || lessons.length;

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-3 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu />
            </button>
            <button
              onClick={() => navigate("/student/mylearning")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowBack className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Back to Courses</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">{progress.percentage}%</span>
              </div>
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
          transition-transform duration-300 z-20 flex-shrink-0
        `}>
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg truncate">{course?.title}</h2>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {progress.completed} of {progress.total} lessons
              </span>
              <span className="font-semibold text-blue-600">
                {progress.percentage}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-2">
            {lessons.map((lesson, index) => (
              <button
                key={lesson._id}
                onClick={() => loadLessonContent(lesson._id)}
                className={`
                  w-full px-4 py-3 flex items-start gap-3 text-left rounded-lg mb-1
                  transition-all duration-200 hover:shadow-sm
                  ${currentLesson?._id === lesson._id
                    ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm'
                    : 'hover:bg-gray-50'
                  }
                  ${completedLessons.has(lesson._id) ? 'opacity-100' : ''}
                `}
              >
                <div className="pt-1 flex-shrink-0">
                  {renderLessonIcon(lesson)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {index + 1}. {lesson.title}
                    </span>
                    {lesson.isPreview && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Preview
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="capitalize">
                      {getLessonType(lesson).replace('_', ' ')}
                    </span>
                    {lesson.duration && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{lesson.duration} min</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {currentLesson ? (
            <div className="max-w-6xl mx-auto">
              {/* Lesson Header */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Lesson {currentIndex} of {totalLessons}
                      </span>
                      <span className="text-sm font-medium text-gray-500 capitalize">
                        {getLessonType(currentLesson)}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {currentLesson.title}
                    </h1>
                    {currentLesson.description && !currentLesson.content && (
                      <p className="text-gray-600 mt-2 max-w-3xl">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!currentLesson.isCompleted && (
                      <button
                        onClick={markLessonComplete}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Mark Complete
                      </button>
                    )}
                    {currentLesson.isCompleted && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                        <CheckCircle className="h-5 w-5" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="mb-8">
                {renderLessonContent()}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t mt-8">
                <button
                  onClick={() => {
                    if (currentLesson.navigation?.previousLesson) {
                      loadLessonContent(currentLesson.navigation.previousLesson._id);
                    }
                  }}
                  disabled={!currentLesson.navigation?.previousLesson}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                    currentLesson.navigation?.previousLesson
                      ? 'text-gray-700 hover:bg-gray-100 hover:shadow'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowBack className="h-5 w-5" />
                  <span className="hidden sm:inline">Previous Lesson</span>
                  <span className="sm:hidden">Previous</span>
                </button>

                <button
                  onClick={() => {
                    if (currentLesson.navigation?.nextLesson) {
                      loadLessonContent(currentLesson.navigation.nextLesson._id);
                    }
                  }}
                  disabled={!currentLesson.navigation?.nextLesson}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors shadow-md ${
                    currentLesson.navigation?.nextLesson
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Next Lesson</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowForward className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Description className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lesson Selected</h3>
              <p className="text-gray-600">Select a lesson from the sidebar to begin learning</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearn;