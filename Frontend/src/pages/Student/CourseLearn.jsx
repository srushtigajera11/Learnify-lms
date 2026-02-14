import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LessonSidebar } from './CourseLearnComponents/LessonSidebar';
import { LessonContent } from './CourseLearnComponents/LessonContent';
import { fetchCourseData, markLessonComplete } from './CourseLearnComponents/fetchCourseData';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';

const CourseLearn = () => {
  const { courseId } = useParams(); // Get courseId from URL
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  /* =========================================
     LOADING + ERROR
  ========================================= */
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
      </div>
    );
  }

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
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseLearn;
