import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  Menu,
  PlayArrow,
  PlayCircle,
  Description,
  Close,
  Notes,
  Bookmark,
  BookmarkBorder,
  Lock,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";
import ReactPlayer from "react-player";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const contentRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [resumeFrom, setResumeFrom] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookmarkedLessons, setBookmarkedLessons] = useState([]);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  /* =========================================
     LOAD COURSE + LESSON LIST
  ========================================= */
  const loadCourseData = async () => {
    try {
      setLoading(true);

      const lessonsRes = await axiosInstance.get(
        `/lessons/course/${courseId}`
      );

      const lessonList = lessonsRes.data.lessons || [];
      setLessons(lessonList);

      if (lessonList.length > 0) {
        loadLessonContent(lessonList[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     LOAD SINGLE LESSON
  ========================================= */
  const loadLessonContent = async (lessonId) => {
    try {
      const res = await axiosInstance.get(`/lessons/${lessonId}`);

      setCurrentLesson(res.data.lesson);
      setResumeFrom(res.data.resumeFrom || 0);
      setWatchProgress(res.data.progress || 0);

      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================
     VIDEO URL DETECTION
  ========================================= */
  const getVideoUrl = () => {
    if (!currentLesson?.materials?.length) return null;

    const videoMaterial = currentLesson.materials.find(
      (m) => m.type === "video"
    );

    return videoMaterial?.url || null;
  };

  const videoUrl = getVideoUrl();

  /* =========================================
     PROGRESS TRACKING
  ========================================= */
  const handleProgress = (state) => {
    const percent = state.played * 100;
    setWatchProgress(percent);

    // Send update every 5 seconds
    if (Math.floor(state.playedSeconds) % 5 === 0) {
      axiosInstance.patch(`/lessons/${currentLesson._id}/progress`, {
        progress: percent,
        lastWatchedTime: state.playedSeconds,
      });

      // Auto mark completed at 90%
      if (percent >= 90 && !completedLessons.includes(currentLesson._id)) {
        setCompletedLessons((prev) => [...prev, currentLesson._id]);
      }
    }
  };

  /* =========================================
     NAVIGATION
  ========================================= */
  const currentIndex = currentLesson
    ? lessons.findIndex((l) => l._id === currentLesson._id)
    : -1;

  const goToPrevious = () => {
    if (currentIndex > 0) {
      loadLessonContent(lessons[currentIndex - 1]._id);
    }
  };

  const goToNext = () => {
    if (currentIndex < lessons.length - 1) {
      loadLessonContent(lessons[currentIndex + 1]._id);
    }
  };

  const progressPercentage =
    lessons.length > 0
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;

  /* =========================================
     LOADING + ERROR
  ========================================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgressbar
          value={75}
          strokeWidth={6}
          styles={buildStyles({
            pathColor: "#5624d0",
            trailColor: "#e5e7eb",
          })}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Lock className="text-red-500 mr-2" />
        {error}
      </div>
    );
  }

  /* =========================================
     UI
  ========================================= */
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b px-4 py-2 flex justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}>
            <ArrowBack />
          </button>
          <h1 className="font-bold">{course?.title || "Course"}</h1>
        </div>

        <div className="flex items-center gap-2">
          <span>{progressPercentage}%</span>
          <div className="w-10 h-10">
            <CircularProgressbar
              value={progressPercentage}
              strokeWidth={10}
              styles={buildStyles({
                pathColor: "#5624d0",
                trailColor: "#e5e7eb",
              })}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-72 bg-white border-r ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          {lessons.map((lesson, idx) => (
            <button
              key={lesson._id}
              onClick={() => loadLessonContent(lesson._id)}
              className="w-full text-left p-3 border-b hover:bg-gray-50"
            >
              {idx + 1}. {lesson.title}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {currentLesson && (
            <>
              {videoUrl ? (
                <ReactPlayer
                  ref={playerRef}
                  url={videoUrl}
                  width="100%"
                  height="500px"
                  controls
                  playing={false}
                  onReady={() => {
                    if (resumeFrom) {
                      playerRef.current.seekTo(resumeFrom, "seconds");
                    }
                  }}
                  onProgress={handleProgress}
                />
              ) : (
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-xl font-bold">
                    {currentLesson.title}
                  </h2>
                  <p>{currentLesson.description}</p>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <button onClick={goToPrevious}>Previous</button>
                <button onClick={goToNext}>Next</button>
              </div>

              {showNotes && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-4 border p-2 rounded"
                  placeholder="Write your notes..."
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearn;
