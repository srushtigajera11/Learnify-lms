import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Menu, 
  Close, 
  ArrowBack,
  CheckCircle,
  Bolt,
  WorkspacePremium,
  Star
} from "@mui/icons-material";

import ContentSidebar from "./ContentSidebar";
import { LessonContent } from "./LessonContent";
import QuizTaker from "./QuizTaker";

import {
  fetchCourseContent,
  fetchLesson,
  fetchQuiz,
  markLessonComplete
} from "./fetchCourseData";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [courseId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseContent(courseId);

      setCourse(data.course);
      setContentItems(data.content);
      setProgress(data.progress);

      // Load first uncompleted item or first item
      const firstUncompleted = data.content.find(item => !item.isCompleted);
      if (firstUncompleted) {
        await loadItem(firstUncompleted);
      } else if (data.content.length > 0) {
        await loadItem(data.content[0]);
      }
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadItem = async (item) => {
    setCurrentItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      if (item.type === "lesson") {
        const lesson = await fetchLesson(courseId, item._id);
        setCurrentData(lesson);
      } else {
        const quiz = await fetchQuiz(courseId, item._id);
        setCurrentData(quiz);
      }
    } catch (error) {
      console.error("Error loading item:", error);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentItem || currentItem.type !== 'lesson') return;

    try {
      await markLessonComplete(courseId, currentItem._id);
      // Reload content to update progress
      await loadContent();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const handleQuizComplete = async () => {
    // Reload content to update progress after quiz submission
    await loadContent();
  };

  const navigateItem = (direction) => {
    const currentIndex = contentItems.findIndex(item => item._id === currentItem._id);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < contentItems.length) {
      loadItem(contentItems[newIndex]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = progress?.completionPercentage || 0;
  const currentIndex = currentItem ? contentItems.findIndex(item => item._id === currentItem._id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < contentItems.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout - Account for your existing navbar */}
      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static top-0 bottom-0 left-0
          w-80 bg-white border-r border-gray-200 z-40
          transition-transform duration-300 shadow-xl lg:shadow-none
          overflow-y-auto
        `}>
          <ContentSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            contentItems={contentItems}
            currentItem={currentItem}
            progress={progress}
            onSelectItem={loadItem}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            {currentItem?.type === "lesson" && currentData ? (
              <>
                {/* Lesson Content */}
                <LessonContent
                  materials={currentData?.materials}
                  title={currentData?.title}
                  description={currentData?.description}
                />
                
                {/* Lesson Navigation */}
                <div className="mt-8 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      onClick={() => navigateItem('prev')}
                      disabled={!hasPrevious}
                      className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-colors"
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={handleMarkComplete}
                      disabled={currentItem.isCompleted}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        currentItem.isCompleted
                          ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-default'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <CheckCircle fontSize="small" />
                      {currentItem.isCompleted ? 'Completed' : 'Mark as Complete'}
                    </button>

                    <button
                      onClick={() => navigateItem('next')}
                      disabled={!hasNext}
                      className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : currentItem?.type === "quiz" && currentData ? (
              <QuizTaker
                quiz={currentData}
                courseId={courseId}
                quizId={currentItem?._id}
                onComplete={handleQuizComplete}
              />
            ) : (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="text-indigo-600" style={{ fontSize: 32 }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Learn?</h3>
                  <p className="text-gray-600 mb-6">Select a lesson or quiz to begin your journey</p>
                  <button
                    onClick={() => {
                      if (contentItems.length > 0) {
                        loadItem(contentItems[0]);
                      }
                      setSidebarOpen(true);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Menu Toggle - Floating Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center"
      >
        {sidebarOpen ? <Close /> : <Menu />}
      </button>
    </div>
  );
}