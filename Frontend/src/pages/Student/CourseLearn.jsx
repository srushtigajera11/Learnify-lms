<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LessonSidebar } from './CourseLearnComponents/LessonSidebar';
import { LessonContent } from './CourseLearnComponents/LessonContent';
import { fetchCourseData, markLessonComplete } from './CourseLearnComponents/fetchCourseData';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
=======
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
>>>>>>> e7b1c6a2658da2fd31f287f08b304b5ec3dd1188

const CourseLearn = () => {
  const { courseId } = useParams(); // Get courseId from URL
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
<<<<<<< HEAD
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
=======
  const [resumeFrom, setResumeFrom] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookmarkedLessons, setBookmarkedLessons] = useState([]);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
>>>>>>> e7b1c6a2658da2fd31f287f08b304b5ec3dd1188

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const { course, lessons } = await fetchCourseData(courseId);
        setCourse(course);
        setLessons(lessons);
        setCompletedLessonIds(lessons.filter(l => l.isCompleted).map(l => l._id));

        if (lessons.length > 0) {
          setCurrentLesson(lessons[0]);
        }
      } catch (err) {
        setError('Failed to load course. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

<<<<<<< HEAD
  const handleLessonSelect = (lessonId) => {
    const lesson = lessons.find(l => l._id === lessonId);
    setCurrentLesson(lesson || null);
  };

  const handleMarkComplete = async (lessonId) => {
    try {
      await markLessonComplete(courseId, lessonId);
      setCompletedLessonIds(prev => [...prev, lessonId]);
    } catch (err) {
      console.error('Failed to mark complete');
    }
  };

  const handlePreviousLesson = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const currentIndex = currentLesson ? lessons.findIndex(l => l._id === currentLesson._id) : -1;
  const hasNext = currentIndex < lessons.length - 1;
  const hasPrevious = currentIndex > 0;
=======
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
>>>>>>> e7b1c6a2658da2fd31f287f08b304b5ec3dd1188

  /* =========================================
     LOADING + ERROR
  ========================================= */
  if (loading) {
    return (
<<<<<<< HEAD
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading course content...</p>
        </div>
=======
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgressbar
          value={75}
          strokeWidth={6}
          styles={buildStyles({
            pathColor: "#5624d0",
            trailColor: "#e5e7eb",
          })}
        />
>>>>>>> e7b1c6a2658da2fd31f287f08b304b5ec3dd1188
      </div>
    );
  }

  if (error) {
    return (
<<<<<<< HEAD
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Course</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
=======
      <div className="min-h-screen flex items-center justify-center">
        <Lock className="text-red-500 mr-2" />
        {error}
>>>>>>> e7b1c6a2658da2fd31f287f08b304b5ec3dd1188
      </div>
    );
  }

<<<<<<< HEAD
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <LessonSidebar
        lessons={lessons}
        currentLessonId={currentLesson?._id || null}
        completedLessonIds={completedLessonIds}
        onLessonSelect={handleLessonSelect}
        onMarkComplete={handleMarkComplete}
      />

      {/* Lesson Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-10">
          {currentLesson ? (
            <>
              <LessonContent
                materials={currentLesson.materials}
                title={currentLesson.title}
                description={currentLesson.description}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-slate-200">
                <button
                  onClick={handlePreviousLesson}
                  disabled={!hasPrevious}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    hasPrevious
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      : 'bg-transparent text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <span className="text-sm text-slate-500 font-medium">
                  Lesson {currentIndex + 1} of {lessons.length}
                </span>

                <button
                  onClick={handleNextLesson}
                  disabled={!hasNext}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    hasNext
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200'
                      : 'bg-transparent text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
              <BookOpen className="w-20 h-20 mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a lesson to begin</p>
            </div>
=======
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
>>>>>>> e7b1c6a2658da2fd31f287f08b304b5ec3dd1188
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseLearn;
