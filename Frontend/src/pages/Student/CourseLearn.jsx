import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  VideoLibrary,
  Description,
  ArrowForward,
  Menu,
  PlayArrow,
  Article,
  Link as LinkIcon,
  YouTube,
  Download,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";
import ReactPlayer from "react-player";

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  /* =========================
     API CALLS
  ========================== */

  const loadCourseData = async () => {
    try {
      setLoading(true);

      const courseRes = await axiosInstance.get(
        `/students/course-details/${courseId}`
      );

      if (!courseRes.data.course?.isEnrolled) {
        setError("You must enroll in this course first");
        return;
      }

      setCourse(courseRes.data.course);

      const lessonsRes = await axiosInstance.get(
        `/students/courses/${courseId}/lessons`
      );

      const lessonList = lessonsRes.data.lessons || [];
      setLessons(lessonList);

      if (lessonList.length > 0) {
        loadLessonContent(lessonList[0]._id);
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
      const res = await axiosInstance.get(
        `/students/courses/${courseId}/lessons/${lessonId}`
      );
      setCurrentLesson(res.data.lesson);
    } catch (err) {
      console.error("Error loading lesson:", err);
      setCurrentLesson(null);
    }
  };

  /* =========================
     VIDEO HELPERS
  ========================== */

  const getVideoType = () => {
    if (!currentLesson?.materials?.length) return null;

    const videoMaterial = currentLesson.materials.find(material =>
      material.type === 'video' ||
      material.type === 'video_lesson' ||
      material.url?.match(/\.(mp4|webm|ogg|mov|avi|wmv|m4v)$/i) ||
      material.url?.includes('youtube') ||
      material.url?.includes('youtu.be') ||
      material.url?.includes('vimeo')
    );

    if (!videoMaterial?.url) return null;

    const url = videoMaterial.url.toLowerCase();

    if (url.includes('youtube') || url.includes('youtu.be')) {
      return { type: 'youtube', url: videoMaterial.url };
    } else if (url.includes('vimeo')) {
      return { type: 'vimeo', url: videoMaterial.url };
    } else if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|m4v)$/)) {
      return { type: 'direct', url: videoMaterial.url };
    }

    return { type: 'external', url: videoMaterial.url };
  };

  const getLessonTypeIcon = (lesson) => {
    const hasVideo = lesson.materials?.some(material =>
      material.type === 'video' ||
      material.type === 'video_lesson' ||
      material.url?.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i) ||
      material.url?.includes('youtube') ||
      material.url?.includes('youtu.be') ||
      material.url?.includes('vimeo')
    );

    if (hasVideo) return { icon: VideoLibrary, label: 'Video', color: 'text-red-600' };
    if (lesson.content || lesson.description) return { icon: Description, label: 'Text', color: 'text-blue-600' };
    if (lesson.materials?.length) return { icon: Article, label: 'Materials', color: 'text-purple-600' };
    return { icon: Description, label: 'Lesson', color: 'text-gray-600' };
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    }
    return `${mins}m`;
  };

  /* =========================
     RENDER STATES
  ========================== */

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600">Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Access Required</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/student/mylearning")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================== */

  const videoInfo = getVideoType();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Bar */}
      <header className="bg-white shadow-lg px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="text-gray-700" />
          </button>
          <button
            onClick={() => navigate("/student/mylearning")}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
          >
            <ArrowBack />
            <span className="hidden sm:inline">Back to Courses</span>
          </button>
        </div>
        <div className="text-center flex-1 px-4">
          <h2 className="font-bold text-lg text-gray-800 truncate">{course?.title}</h2>
          {currentLesson && (
            <p className="text-sm text-gray-500 truncate">
              Lesson {lessons.findIndex(l => l._id === currentLesson._id) + 1} of {lessons.length}
            </p>
          )}
        </div>
        <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 w-80 bg-white shadow-xl h-full overflow-y-auto transition-all duration-300 flex flex-col`}
        >
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-800 text-lg">Course Content</h3>
            <p className="text-sm text-gray-500 mt-1">
              {lessons.length} lessons • {lessons.filter(l => l.isCompleted).length} completed
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {lessons.map((lesson, idx) => {
              const iconInfo = getLessonTypeIcon(lesson);
              const Icon = iconInfo.icon;
              
              return (
                <button
                  key={lesson._id}
                  onClick={() => loadLessonContent(lesson._id)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-all duration-200 group ${
                    currentLesson?._id === lesson._id
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${iconInfo.color} bg-opacity-10`}>
                      <Icon fontSize="small" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 group-hover:text-blue-600">
                          {idx + 1}. {lesson.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {lesson.duration && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                          {lesson.isPreview && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              Preview
                            </span>
                          )}
                          {lesson.isCompleted && (
                            <CheckCircle className="text-green-500 text-lg" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${iconInfo.color}`}>
                          {iconInfo.label}
                        </span>
                        {lesson.materials?.length > 0 && (
                          <span className="text-xs text-gray-500">
                            • {lesson.materials.length} material{lesson.materials.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {!currentLesson ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4 text-gray-300">📚</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Lesson</h3>
              <p className="text-gray-500 max-w-md">
                Choose a lesson from the sidebar to start learning. Each lesson contains video, text, or interactive content.
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {/* Lesson Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Lesson {lessons.findIndex(l => l._id === currentLesson._id) + 1}
                      </span>
                      {currentLesson.isCompleted && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          <CheckCircle fontSize="small" />
                          Completed
                        </span>
                      )}
                      {currentLesson.isPreview && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          Free Preview
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {currentLesson.title}
                    </h1>
                    {currentLesson.description && (
                      <p className="text-gray-600 text-lg">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {currentLesson.duration && (
                      <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-bold text-gray-800">
                          {formatDuration(currentLesson.duration)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Content */}
              {videoInfo && (
                <div className="mb-8">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <VideoLibrary className="text-red-500" />
                        Video Content
                      </h3>
                    </div>
                    
                    <div className="p-6">
                      {videoInfo.type === 'youtube' ? (
                        <div className="text-center">
                          <div className="max-w-md mx-auto mb-6">
                            <div className="text-6xl mb-4 text-red-500">
                              <YouTube fontSize="inherit" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                              YouTube Video
                            </h4>
                            <p className="text-gray-600 mb-6">
                              This lesson contains a YouTube video. Click the button below to watch it on YouTube.
                            </p>
                            <a
                              href={videoInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md hover:shadow-lg"
                            >
                              <PlayArrow />
                              Watch on YouTube
                            </a>
                            <p className="text-sm text-gray-500 mt-4">
                              Video will open in a new tab
                            </p>
                          </div>
                        </div>
                      ) : videoInfo.type === 'direct' ? (
                        <div>
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <ReactPlayer
                              url={videoInfo.url}
                              controls
                              width="100%"
                              height="100%"
                              playsinline
                              config={{
                                file: {
                                  attributes: {
                                    controlsList: 'nodownload',
                                    style: { width: '100%', height: '100%' }
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Direct video playback
                            </span>
                            <a
                              href={videoInfo.url}
                              download
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Download fontSize="small" />
                              Download Video
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4 text-blue-500">🎬</div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            External Video Content
                          </h4>
                          <p className="text-gray-600 mb-6">
                            This lesson contains video content from an external platform.
                          </p>
                          <a
                            href={videoInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <PlayArrow />
                            Watch Video
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Text Content */}
              {(currentLesson.content || currentLesson.description) && !videoInfo && (
                <div className="mb-8">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Description className="text-blue-500" />
                        Lesson Content
                      </h3>
                    </div>
                    <div className="p-6">
                      <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            currentLesson.content?.trim() ||
                            `<div class="text-gray-700 leading-relaxed">${currentLesson.description}</div>`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Materials */}
              {currentLesson.materials && currentLesson.materials.length > 0 && (
                <div className="mb-8">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Article className="text-purple-500" />
                        Lesson Materials
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({currentLesson.materials.length})
                        </span>
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {currentLesson.materials.map((material, idx) => {
                          const isVideo = material.type === 'video' || 
                                         material.type === 'video_lesson' ||
                                         material.url?.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i);
                          const isYoutube = material.url?.includes('youtube') || 
                                           material.url?.includes('youtu.be');
                          const isExternalLink = material.type === 'link' || 
                                                (!isVideo && !isYoutube && material.url);
                          const isDocument = material.type === 'document';

                          let Icon = Article;
                          let iconColor = 'text-purple-600';
                          let bgColor = 'bg-purple-50';

                          if (isVideo) {
                            Icon = VideoLibrary;
                            iconColor = 'text-red-600';
                            bgColor = 'bg-red-50';
                          } else if (isYoutube) {
                            Icon = YouTube;
                            iconColor = 'text-red-600';
                            bgColor = 'bg-red-50';
                          } else if (isExternalLink) {
                            Icon = LinkIcon;
                            iconColor = 'text-blue-600';
                            bgColor = 'bg-blue-50';
                          } else if (isDocument) {
                            Icon = Description;
                            iconColor = 'text-green-600';
                            bgColor = 'bg-green-50';
                          }

                          return (
                            <div
                              key={idx}
                              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${bgColor} ${iconColor}`}>
                                  <Icon />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">
                                    {material.name || `Material ${idx + 1}`}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {material.description || 'No description'}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                      {material.type || 'file'}
                                    </span>
                                    <a
                                      href={material.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
                                        isVideo || isYoutube
                                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      }`}
                                    >
                                      {isVideo || isYoutube ? 'Watch' : 'View'}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-12 mb-8">
                <button
                  onClick={() => {
                    const idx = lessons.findIndex(l => l._id === currentLesson._id);
                    if (idx > 0) loadLessonContent(lessons[idx - 1]._id);
                  }}
                  className="px-8 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={lessons.findIndex(l => l._id === currentLesson._id) === 0}
                >
                  <ArrowBack />
                  <div className="text-left">
                    <div className="text-sm text-gray-500">Previous</div>
                    <div className="font-medium">
                      {lessons[lessons.findIndex(l => l._id === currentLesson._id) - 1]?.title || 'No Previous Lesson'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const idx = lessons.findIndex(l => l._id === currentLesson._id);
                    if (idx < lessons.length - 1) {
                      loadLessonContent(lessons[idx + 1]._id);
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
                >
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Next</div>
                    <div className="font-medium">
                      {lessons[lessons.findIndex(l => l._id === currentLesson._id) + 1]?.title || 'Course Complete'}
                    </div>
                  </div>
                  <ArrowForward />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Course Progress
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round((lessons.filter(l => l.isCompleted).length / lessons.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${(lessons.filter(l => l.isCompleted).length / lessons.length) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {lessons.filter(l => l.isCompleted).length} of {lessons.length} lessons completed
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearn;