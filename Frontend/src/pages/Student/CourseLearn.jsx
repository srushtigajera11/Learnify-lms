import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  VideoLibrary,
  Description,
  Menu,
  PlayArrow,
  Article,
  Link as LinkIcon,
  Lock,
  Notes,
  Quiz,
  PlayCircle,
  Bookmark,
  BookmarkBorder,
  Share,
  Close,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";
import ReactPlayer from "react-player";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const contentRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [completedLessons, setCompletedLessons] = useState([]);
  const [bookmarkedLessons, setBookmarkedLessons] = useState([]);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseRes = await axiosInstance.get(`/students/course-details/${courseId}`);

      if (!courseRes.data.course?.isEnrolled) {
        setError("You must enroll in this course first");
        return;
      }

      setCourse(courseRes.data.course);
      const lessonsRes = await axiosInstance.get(`/students/courses/${courseId}/lessons`);
      const lessonList = lessonsRes.data.lessons || [];
      setLessons(lessonList);

      const completed = lessonList.filter(lesson => lesson.isCompleted).map(l => l._id);
      setCompletedLessons(completed);

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
      const res = await axiosInstance.get(`/students/courses/${courseId}/lessons/${lessonId}`);
      setCurrentLesson(res.data.lesson);
      
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Error loading lesson:", err);
      setCurrentLesson(null);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await axiosInstance.post(`/students/courses/${courseId}/lessons/${lessonId}/complete`);
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons([...completedLessons, lessonId]);
      }
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  const toggleBookmark = (lessonId) => {
    if (bookmarkedLessons.includes(lessonId)) {
      setBookmarkedLessons(bookmarkedLessons.filter(id => id !== lessonId));
    } else {
      setBookmarkedLessons([...bookmarkedLessons, lessonId]);
    }
  };

  const getVideoUrl = () => {
    if (!currentLesson?.materials?.length) return null;

    const videoMaterial = currentLesson.materials.find(m =>
      m.type === "video" ||
      m.type === "video_lesson" ||
      /youtube|youtu\.be|vimeo|\.mp4|\.webm|\.ogg|\.mov|\.m4v/i.test(m.url || "")
    );

    return videoMaterial?.url || null;
  };

  const getLessonType = (lesson) => {
    if (lesson.materials?.some(material =>
      material.type === 'video' ||
      material.type === 'video_lesson' ||
      material.url?.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i) ||
      material.url?.includes('youtube') ||
      material.url?.includes('youtu.be') ||
      material.url?.includes('vimeo')
    )) {
      return 'video';
    }
    if (lesson.lessonType === 'quiz') return 'quiz';
    if (lesson.materials?.length && !lesson.content) return 'material';
    return 'text';
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return { icon: PlayCircle, color: 'text-red-500' };
      case 'quiz': return { icon: Quiz, color: 'text-orange-500' };
      case 'material': return { icon: Article, color: 'text-purple-500' };
      default: return { icon: Description, color: 'text-blue-500' };
    }
  };

  const goToPrevious = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson._id);
    if (idx > 0) loadLessonContent(lessons[idx - 1]._id);
  };

  const goToNext = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson._id);
    if (idx < lessons.length - 1) loadLessonContent(lessons[idx + 1]._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <CircularProgressbar
              value={75}
              strokeWidth={6}
              styles={buildStyles({
                pathColor: '#5624d0',
                trailColor: '#e5e7eb',
              })}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Loading Course...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="w-full py-2.5 bg-[#5624d0] text-white font-semibold rounded-lg hover:bg-[#4a1fb8] mb-2"
          >
            Enroll in Course
          </button>
          <button
            onClick={() => navigate("/student/mylearning")}
            className="w-full py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl();
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;
  const currentIndex = currentLesson ? lessons.findIndex(l => l._id === currentLesson._id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-gray-100 rounded lg:hidden">
              <Menu fontSize="small" />
            </button>
            <button onClick={() => navigate("/student/mylearning")} className="flex items-center gap-1.5 text-gray-700 hover:text-[#5624d0]">
              <ArrowBack fontSize="small" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
            <div className="hidden md:block h-4 w-px bg-gray-300"></div>
            <h1 className="text-sm font-bold text-gray-900 truncate">{course?.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-600">{progressPercentage}%</span>
              <div className="w-10 h-10">
                <CircularProgressbar
                  value={progressPercentage}
                  strokeWidth={10}
                  styles={buildStyles({ pathColor: '#5624d0', trailColor: '#e5e7eb' })}
                />
              </div>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <Share fontSize="small" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300
          shadow-xl lg:shadow-none
        `}>
          {/* Sidebar Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-sm">Course Content</h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-200 rounded">
                <Close fontSize="small" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-600">{completedLessons.length}/{lessons.length} complete</span>
              <span className="font-semibold text-[#5624d0]">{progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5624d0] rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto">
            {lessons.map((lesson, idx) => {
              const lessonType = getLessonType(lesson);
              const { icon: Icon, color } = getLessonIcon(lessonType);
              const isCompleted = completedLessons.includes(lesson._id);
              const isCurrent = currentLesson?._id === lesson._id;

              return (
                <button
                  key={lesson._id}
                  onClick={() => loadLessonContent(lesson._id)}
                  className={`w-full text-left p-2.5 border-b border-gray-100 flex items-start gap-2 hover:bg-gray-50 transition ${
                    isCurrent ? 'bg-blue-50 border-l-4 border-l-[#5624d0]' : ''
                  }`}
                >
                  <div className={`flex items-center justify-center min-w-[20px] w-5 h-5 rounded-full mt-0.5 ${
                    isCompleted ? 'bg-green-100' : 'border-2 border-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="text-green-600" style={{ fontSize: '16px' }} />
                    ) : (
                      <span className="text-[10px] font-medium text-gray-600">{idx + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs font-medium leading-tight mb-1 ${isCurrent ? 'text-[#5624d0]' : 'text-gray-900'}`}>
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Icon style={{ fontSize: '12px' }} className={color} />
                      <span className="text-[10px] text-gray-600 capitalize">{lessonType}</span>
                      {lesson.duration && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-[10px] text-gray-500">
                            {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <button 
              onClick={() => currentLesson && markLessonComplete(currentLesson._id)}
              disabled={!currentLesson || completedLessons.includes(currentLesson?._id)}
              className="w-full py-2 bg-[#5624d0] text-white text-sm font-semibold rounded-lg hover:bg-[#4a1fb8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completedLessons.includes(currentLesson?._id) ? '✓ Completed' : 'Mark Complete'}
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main ref={contentRef} className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-3">
              {/* Video Player - SIMPLIFIED */}
              {videoUrl && (
                <div className="mb-3">
                  <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                    <div className="relative aspect-video bg-black">
                      <ReactPlayer
                        ref={playerRef}
                        url={videoUrl}
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={false}
                        onEnded={() => {
                          if (currentLesson && !completedLessons.includes(currentLesson._id)) {
                            markLessonComplete(currentLesson._id);
                          }
                        }}
                        config={{
                          youtube: {
                            playerVars: { 
                              showinfo: 1, 
                              modestbranding: 1, 
                              rel: 0,
                              autoplay: 0
                            }
                          },
                          vimeo: {
                            playerOptions: {
                              autoplay: false
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Simple Controls */}
                  <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPrevious}
                        disabled={!hasPrevious}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-sm rounded hover:border-[#5624d0] disabled:opacity-50"
                      >
                        <span className="text-xs">Previous</span>
                      </button>
                      <button
                        onClick={goToNext}
                        disabled={!hasNext}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-sm rounded hover:border-[#5624d0] disabled:opacity-50"
                      >
                        <span className="text-xs">Next</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowNotes(!showNotes)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                          showNotes ? 'bg-[#5624d0] text-white' : 'bg-white border border-gray-300'
                        }`}
                      >
                        <Notes fontSize="small" />
                        <span className="text-xs">Notes</span>
                      </button>
                      <button
                        onClick={() => toggleBookmark(currentLesson._id)}
                        className="p-1.5 bg-white border border-gray-300 rounded hover:border-yellow-500"
                      >
                        {bookmarkedLessons.includes(currentLesson._id) ? (
                          <Bookmark className="text-yellow-500" fontSize="small" />
                        ) : (
                          <BookmarkBorder fontSize="small" />
                        )}
                      </button>
                      <button
                        onClick={() => markLessonComplete(currentLesson._id)}
                        disabled={completedLessons.includes(currentLesson._id)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold ${
                          completedLessons.includes(currentLesson._id)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-[#5624d0] text-white hover:bg-[#4a1fb8]'
                        }`}
                      >
                        {completedLessons.includes(currentLesson._id) ? '✓ Done' : 'Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {showNotes && (
                <div className="mb-3 bg-white rounded-lg border border-gray-200">
                  <div className="p-2.5 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Notes fontSize="small" />
                      My Notes
                    </h3>
                    <button onClick={() => setShowNotes(false)} className="p-1 hover:bg-gray-100 rounded">
                      <Close fontSize="small" />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Type your notes here..."
                      className="w-full h-32 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#5624d0] focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setNotes("")} className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded">
                        Clear
                      </button>
                      <button className="px-4 py-1.5 text-xs bg-[#5624d0] text-white rounded hover:bg-[#4a1fb8] font-semibold">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              {(currentLesson.description || currentLesson.content) && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-bold">About this lesson</h3>
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {currentLesson.content ? (
                        <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                      ) : (
                        <p>{currentLesson.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-[#5624d0] to-[#7c3aed] rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayArrow className="text-white" style={{ fontSize: '40px' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Learn?</h3>
                <p className="text-gray-600 mb-6">Select a lesson from the sidebar to begin.</p>
                <button
                  onClick={() => lessons.length > 0 && loadLessonContent(lessons[0]._id)}
                  className="px-6 py-3 bg-[#5624d0] text-white font-bold rounded-lg hover:bg-[#4a1fb8]"
                >
                  Start First Lesson
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearn;