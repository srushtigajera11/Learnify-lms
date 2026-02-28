import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Menu, Close, CheckCircle, Star, Bolt } from "@mui/icons-material";

import ContentSidebar    from "./ContentSidebar";
import { LessonContent } from "./LessonContent";
import QuizTaker         from "./QuizTaker";
import CertificateViewer from "./CertificateViewer";

import {
  fetchCourseContent,
  fetchLesson,
  fetchQuiz,
  markLessonComplete,
} from "./fetchCourseData";

// ── XP Toast ─────────────────────────────────────────────────────────────────
function XPToast({ xp, visible }) {
  if (!visible || !xp) return null;
  return (
    <div className={`
      fixed top-20 right-6 z-50 flex items-center gap-2
      bg-yellow-400 text-yellow-900 font-bold px-5 py-3 rounded-xl shadow-xl
      transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
    `}>
      <Bolt />
      +{xp} XP
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CoursePlayer() {
  const { courseId } = useParams();

  const [course,       setCourse]       = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [currentItem,  setCurrentItem]  = useState(null);
  const [currentData,  setCurrentData]  = useState(null);
  const [progress,     setProgress]     = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [loading,      setLoading]      = useState(true);

  // XP toast state
  const [xpToast,      setXpToast]      = useState({ visible: false, amount: 0 });

  // ── loaders ────────────────────────────────────────────────────────────────
  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCourseContent(courseId);
      setCourse(data.course);
      setContentItems(data.content);
      setProgress(data.progress);

      // Resume from first uncompleted item
      const firstUncompleted = data.content.find(item => !item.isCompleted);
      const target = firstUncompleted || data.content[0];
      if (target) await loadItem(target, data.content);
    } catch (err) {
      console.error("Error loading course:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadContent(); }, [loadContent]);

  const loadItem = async (item, items) => {
    setCurrentItem(item);
    setCurrentData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      if (item.type === "lesson") {
        const lesson = await fetchLesson(courseId, item._id);
        setCurrentData(lesson);
      } else if (item.type === "quiz") {
        const quiz = await fetchQuiz(courseId, item._id);
        setCurrentData(quiz);
      }
      // certificate type needs no extra fetch
    } catch (err) {
      console.error("Error loading item:", err);
    }
  };

  // ── mark lesson complete ──────────────────────────────────────────────────
  const handleMarkComplete = async () => {
    if (!currentItem || currentItem.type !== "lesson" || currentItem.isCompleted) return;

    try {
      const result = await markLessonComplete(courseId, currentItem._id);

      // Show XP toast (5 XP per lesson)
      if (!currentItem.isCompleted) {
        showXP(5);
      }

      // Refresh so sidebar + progress bar update
      await loadContent();
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  // ── quiz submitted callback ───────────────────────────────────────────────
  const handleQuizComplete = async (result) => {
    if (result?.xpEarned > 0) showXP(result.xpEarned);
    await loadContent();
  };

  // ── navigation ────────────────────────────────────────────────────────────
  const navigateItem = (direction) => {
    const idx = contentItems.findIndex(i => i._id === currentItem?._id);
    const next = direction === "next" ? idx + 1 : idx - 1;
    if (next >= 0 && next < contentItems.length) {
      loadItem(contentItems[next], contentItems);
    }
  };

  // ── XP toast helper ───────────────────────────────────────────────────────
  const showXP = (amount) => {
    setXpToast({ visible: true, amount });
    setTimeout(() => setXpToast({ visible: false, amount }), 2500);
  };

  // ── derived state ─────────────────────────────────────────────────────────
  const currentIndex = currentItem
    ? contentItems.findIndex(i => i._id === currentItem._id)
    : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext     = currentIndex < contentItems.length - 1;

  // ── loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course content…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <XPToast xp={xpToast.amount} visible={xpToast.visible} />

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 fixed lg:static top-0 bottom-0 left-0
          w-80 bg-white border-r border-gray-200 z-40
          transition-transform duration-300 shadow-xl lg:shadow-none overflow-y-auto
        `}>
          <ContentSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            contentItems={contentItems}
            currentItem={currentItem}
            progress={progress}
            onSelectItem={(item) => loadItem(item, contentItems)}
          />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

            {/* ── LESSON ── */}
            {currentItem?.type === "lesson" && currentData ? (
              <>
                <LessonContent
                  materials={currentData.materials}
                  title={currentData.title}
                  description={currentData.description}
                />

                <div className="mt-8 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      onClick={() => navigateItem("prev")}
                      disabled={!hasPrevious}
                      className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <button
                      onClick={handleMarkComplete}
                      disabled={currentItem.isCompleted}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        currentItem.isCompleted
                          ? "bg-green-50 text-green-700 border-2 border-green-200 cursor-default"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <CheckCircle fontSize="small" />
                      {currentItem.isCompleted ? "✅ Completed" : "Mark as Complete"}
                    </button>

                    <button
                      onClick={() => navigateItem("next")}
                      disabled={!hasNext}
                      className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : currentItem?.type === "quiz" && currentData ? (
              /* ── QUIZ ── */
              <QuizTaker
                quiz={currentData}
                courseId={courseId}
                quizId={currentItem._id}
                onComplete={handleQuizComplete}
              />
            ) : currentItem?.type === "certificate" ? (
              /* ── CERTIFICATE ── */
              <CertificateViewer
                courseId={courseId}
                certificate={currentItem.certificate}
                isLocked={currentItem.isLocked}
                onClaim={async (cert) => {
                  showXP(0);      // no XP for claiming, but could add
                  await loadContent();
                }}
              />
            ) : (
              /* ── EMPTY STATE ── */
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="text-indigo-600" style={{ fontSize: 32 }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Learn?</h3>
                  <p className="text-gray-600 mb-6">Select a lesson or quiz to begin</p>
                  <button
                    onClick={() => {
                      if (contentItems.length > 0) loadItem(contentItems[0], contentItems);
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

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center"
      >
        {sidebarOpen ? <Close /> : <Menu />}
      </button>
    </div>
  );
}