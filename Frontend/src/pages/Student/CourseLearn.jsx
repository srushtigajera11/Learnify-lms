import React, { useEffect, useState, useRef } from "react";
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
  Lock,
  LockOpen,
  AccessTime,
  Notes,
  Assignment,
  Quiz,
  ExpandMore,
  ExpandLess,
  Subtitles,
  Speed,
  Settings,
  Fullscreen,
  PlayCircle,
  PauseCircle,
  VolumeUp,
  VolumeOff,
  SkipNext,
  SkipPrevious,
  ClosedCaption,
  FiberManualRecord,
  Bookmark,
  BookmarkBorder,
  Share,
  MoreVert,
  KeyboardArrowDown,
  KeyboardArrowUp,
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
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [completedLessons, setCompletedLessons] = useState([]);
  const [bookmarkedLessons, setBookmarkedLessons] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

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

      // Calculate completed lessons
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
      const res = await axiosInstance.get(
        `/students/courses/${courseId}/lessons/${lessonId}`
      );
      setCurrentLesson(res.data.lesson);
      setPlaying(false);
      setPlayed(0);
      // Scroll to top when new lesson loads
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
      await axiosInstance.post(
        `/students/courses/${courseId}/lessons/${lessonId}/complete`
      );
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

  /* =========================
     VIDEO HELPERS
  ========================== */
const getVideoType = () => {
  if (!currentLesson?.materials?.length) return null;

  const videoMaterial = currentLesson.materials.find(m =>
    m.type === "video" ||
    m.type === "video_lesson" ||
    /youtube|youtu\.be|vimeo|\.mp4|\.webm|\.ogg|\.mov|\.m4v/i.test(m.url || "")
  );

  if (!videoMaterial) return null;

  const url = videoMaterial.url;

  if (/youtube|youtu\.be/i.test(url)) {
    return { type: "youtube", url };
  }

  if (/vimeo/i.test(url)) {
    return { type: "vimeo", url };
  }

  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(url)) {
    return { type: "direct", url };
  }

  return { type: "external", url };
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

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  /* =========================
     VIDEO PLAYER HANDLERS
  ========================== */

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    setShowPlaybackOptions(false);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value));
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (currentLesson && !completedLessons.includes(currentLesson._id)) {
      markLessonComplete(currentLesson._id);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  /* =========================
     RENDER STATES
  ========================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <CircularProgressbar
              value={60}
              strokeWidth={8}
              styles={buildStyles({
                pathColor: '#5624d0',
                trailColor: '#f5f5f5',
              })}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Course</h3>
          <p className="text-gray-600">Preparing your learning experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Course Access Required</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="w-full py-3 bg-[#5624d0] text-white font-semibold rounded-lg hover:bg-[#4a1fb8] transition mb-3"
          >
            Enroll in Course
          </button>
          <button
            onClick={() => navigate("/student/mylearning")}
            className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  const videoInfo = getVideoType();
  const progressPercentage = lessons.length > 0 
    ? Math.round((completedLessons.length / lessons.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Menu className="text-gray-700" />
              </button>
              <button
                onClick={() => navigate("/student/mylearning")}
                className="flex items-center gap-2 text-gray-700 hover:text-[#5624d0] transition"
              >
                <ArrowBack />
                <span className="hidden md:inline font-medium">My Learning</span>
              </button>
              <div className="hidden md:block h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">
                {course?.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="font-semibold text-[#5624d0]">{progressPercentage}%</div>
                </div>
                <div className="w-12">
                  <CircularProgressbar
                    value={progressPercentage}
                    strokeWidth={12}
                    styles={buildStyles({
                      pathColor: '#5624d0',
                      trailColor: '#e5e7eb',
                      textSize: '30px',
                    })}
                  />
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
          w-80 lg:w-96 bg-white border-r border-gray-200 h-[calc(100vh-64px)]
          overflow-hidden flex flex-col transition-transform duration-300
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900">Course Content</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {completedLessons.length}/{lessons.length}
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#5624d0] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <AccessTime fontSize="small" />
                {Math.round(lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) / 60)}h total
              </span>
              <span>•</span>
              <span>{lessons.length} lessons</span>
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto">
            {lessons.map((lesson, idx) => {
              const lessonType = getLessonType(lesson);
              const { icon: Icon, color } = getLessonIcon(lessonType);
              const isCompleted = completedLessons.includes(lesson._id);
              const isBookmarked = bookmarkedLessons.includes(lesson._id);
              const isCurrent = currentLesson?._id === lesson._id;
              const duration = lesson.duration ? `${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60).toString().padStart(2, '0')}` : null;

              return (
                <div
                  key={lesson._id}
                  className={`border-b border-gray-100 ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <button
                    onClick={() => loadLessonContent(lesson._id)}
                    className="w-full text-left p-4 flex items-start gap-3 group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="text-green-500 text-sm" />
                      ) : (
                        <span className="text-xs text-gray-500">{idx + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium truncate ${isCurrent ? 'text-[#5624d0]' : 'text-gray-900'}`}>
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-2 ml-2">
                          {duration && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {duration}
                            </span>
                          )}
                          {lesson.isPreview && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Preview
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Icon className={`text-sm ${color}`} />
                        <span className="text-xs text-gray-500 capitalize">
                          {lessonType}
                          {lesson.materials?.length > 1 && lessonType !== 'quiz' && ` • ${lesson.materials.length} resources`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(lesson._id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        {isBookmarked ? (
                          <Bookmark className="text-yellow-500 text-sm" />
                        ) : (
                          <BookmarkBorder className="text-gray-400 text-sm" />
                        )}
                      </button>
                      {isCurrent ? (
                        <FiberManualRecord className="text-[#5624d0] animate-pulse text-sm" />
                      ) : (
                        <PlayArrow className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              <div className="flex items-center justify-between">
                <span>Course Progress</span>
                <span className="font-semibold">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-[#5624d0] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            {progressPercentage === 100 ? (
              <button className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition mt-2">
                <CheckCircle className="mr-2" />
                Course Completed
              </button>
            ) : (
              <button 
                onClick={() => currentLesson && markLessonComplete(currentLesson._id)}
                disabled={!currentLesson || completedLessons.includes(currentLesson._id)}
                className="w-full py-2.5 bg-[#5624d0] text-white font-semibold rounded-lg hover:bg-[#4a1fb8] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Mark as Complete
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main 
          ref={contentRef}
          className="flex-1 h-[calc(100vh-64px)] overflow-y-auto"
        >
          {currentLesson ? (
            <div className="max-w-6xl mx-auto p-4 lg:p-8">
              {/* Video Player Section */}
              {videoInfo && (
                <div className="mb-8">
                  <div className="bg-black rounded-xl overflow-hidden shadow-xl relative group">
                    {/* Video Player */}
                    <div className="aspect-video bg-black">
                      {/* YOUTUBE / VIMEO → native controls */}
                      {(videoInfo.type === "youtube" || videoInfo.type === "vimeo") && (
                        <ReactPlayer
                          url={videoInfo.url}
                          width="100%"
                          height="100%"
                          controls
                          playing={playing}
                          onEnded={handleEnded}
                          onProgress={handleProgress}
                          onDuration={handleDuration}
                        />
                      )}

                      {/* MP4 / DIRECT → custom controls */}
                      {videoInfo.type === "direct" && (
                        <div className="relative w-full h-full">
                          <ReactPlayer
                            ref={playerRef}
                            url={videoInfo.url}
                            playing={playing}
                            controls={false}
                            width="100%"
                            height="100%"
                            volume={volume}
                            muted={muted}
                            playbackRate={playbackRate}
                            onProgress={handleProgress}
                            onDuration={handleDuration}
                            onEnded={handleEnded}
                          />

                          {/* Keep your existing custom overlay controls here */}
                        </div>
                      )}
                    </div>
                    {videoInfo?.type === "youtube" && (
                      <div className="mt-3 flex justify-end">
                        <a
                          href={videoInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-red-600 font-medium hover:underline"
                        >
                          <YouTube />
                          Watch on YouTube
                        </a>
                      </div>
                    )}


                    
                    {/* Video Title Bar (Always Visible) */}
                    <div className="p-4 bg-white border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">{currentLesson.title}</h2>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markLessonComplete(currentLesson._id)}
                            disabled={completedLessons.includes(currentLesson._id)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              completedLessons.includes(currentLesson._id)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-[#5624d0] text-white hover:bg-[#4a1fb8]'
                            }`}
                          >
                            {completedLessons.includes(currentLesson._id) ? (
                              <>
                                <CheckCircle className="mr-2" />
                                Completed
                              </>
                            ) : (
                              'Mark as Complete'
                            )}
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVert className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions Bar */}
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          const idx = lessons.findIndex(l => l._id === currentLesson._id);
                          if (idx > 0) loadLessonContent(lessons[idx - 1]._id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#5624d0]"
                      >
                        <SkipPrevious />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      <button
                        onClick={() => {
                          const idx = lessons.findIndex(l => l._id === currentLesson._id);
                          if (idx < lessons.length - 1) loadLessonContent(lessons[idx + 1]._id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#5624d0]"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <SkipNext />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowNotes(!showNotes)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <Notes />
                        <span className="hidden sm:inline">Notes</span>
                      </button>
                      <button
                        onClick={() => toggleBookmark(currentLesson._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        {bookmarkedLessons.includes(currentLesson._id) ? (
                          <Bookmark className="text-yellow-500" />
                        ) : (
                          <BookmarkBorder />
                        )}
                        <span className="hidden sm:inline">Bookmark</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {showNotes && (
                <div className="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Notes />
                      My Notes
                    </h3>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes here... (Markdown supported)"
                      className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5624d0] focus:border-transparent"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        Clear
                      </button>
                      <button className="px-4 py-2 bg-[#5624d0] text-white rounded-lg hover:bg-[#4a1fb8]">
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Description */}
                  {(currentLesson.description || currentLesson.content) && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">About this lesson</h3>
                      </div>
                      <div className="p-6">
                        <div className="prose prose-lg max-w-none">
                          {currentLesson.content ? (
                            <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                          ) : (
                            <p className="text-gray-700 leading-relaxed">{currentLesson.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Materials/Resources */}
                  {currentLesson.materials && currentLesson.materials.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Article />
                          Lesson Resources
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Downloadable resources, links, and supplementary materials
                        </p>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {currentLesson.materials.map((material, idx) => {
                            const isVideo = material.type === 'video' || material.type === 'video_lesson';
                            const isYoutube = /youtube|youtu\.be/i.test(material.url || ""); 
                            const isDocument = material.type === 'document';
                            const isLink = material.type === 'link';

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#5624d0] hover:shadow-sm transition"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    isVideo || isYoutube ? 'bg-red-50 text-red-600' :
                                    isDocument ? 'bg-blue-50 text-blue-600' :
                                    'bg-purple-50 text-purple-600'
                                  }`}>
                                    {isVideo || isYoutube ? <VideoLibrary /> :
                                     isDocument ? <Description /> :
                                     <LinkIcon />}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{material.name}</h4>
                                    <p className="text-sm text-gray-600">{material.description}</p>
                                  </div>
                                </div>
                                <a
                                  href={material.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
                                >
                                  {isVideo || isYoutube ? 'Watch' : 'View'}
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar - Course Navigation */}
                <div className="lg:col-span-1">
                  {/* Next Up */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Up next</h3>
                    </div>
                    <div className="p-2">
                      {lessons.slice(
                        lessons.findIndex(l => l._id === currentLesson._id) + 1,
                        lessons.findIndex(l => l._id === currentLesson._id) + 4
                      ).map((lesson, idx) => {
                        const lessonType = getLessonType(lesson);
                        const { icon: Icon } = getLessonIcon(lessonType);
                        
                        return (
                          <button
                            key={lesson._id}
                            onClick={() => loadLessonContent(lesson._id)}
                            className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Icon className="text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {lessonType} • {lesson.duration ? `${Math.floor(lesson.duration / 60)}m` : '2m'}
                              </p>
                            </div>
                            {lesson.isPreview && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Preview
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button className="w-full p-3 text-center text-[#5624d0] font-medium hover:bg-gray-50 border-t border-gray-200">
                      Show all lessons
                    </button>
                  </div>

                  {/* Course Progress */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Your progress</h3>
                    </div>
                    <div className="p-4">
                      <div className="text-center mb-4">
                        <div className="inline-block relative">
                          <CircularProgressbar
                            value={progressPercentage}
                            strokeWidth={8}
                            styles={buildStyles({
                              pathColor: '#5624d0',
                              trailColor: '#e5e7eb',
                              textSize: '32px',
                            })}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">
                              {progressPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completed</span>
                          <span className="font-medium">{completedLessons.length}/{lessons.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Time spent</span>
                          <span className="font-medium">
                            {Math.round(lessons
                              .filter(l => completedLessons.includes(l._id))
                              .reduce((acc, lesson) => acc + (lesson.duration || 0), 0) / 60)}h
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last studied</span>
                          <span className="font-medium">Today</span>
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 py-3 bg-[#5624d0] text-white font-semibold rounded-lg hover:bg-[#4a1fb8] transition">
                        Continue Learning
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayArrow className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Learning</h3>
                <p className="text-gray-600 mb-6">
                  Select a lesson from the sidebar to begin your learning journey. Each lesson contains valuable content to help you master the subject.
                </p>
                <button
                  onClick={() => lessons.length > 0 && loadLessonContent(lessons[0]._id)}
                  className="px-6 py-3 bg-[#5624d0] text-white font-semibold rounded-lg hover:bg-[#4a1fb8] transition"
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