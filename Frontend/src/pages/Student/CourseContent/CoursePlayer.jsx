import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ContentSidebar from "./ContentSidebar";
import { LessonContent } from "./LessonContent";
import QuizTaker from "./QuizTaker";

import {
  fetchCourseContent,
  fetchLesson,
  fetchQuiz
} from "./fetchCourseData";

export default function CoursePlayer() {
  const { courseId } = useParams();

  const [contentItems, setContentItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadContent();
  }, [courseId]);

  const loadContent = async () => {
    const data = await fetchCourseContent(courseId);

    setContentItems(data.content);
    setProgress(data.progress);

    if (data.content.length > 0) loadItem(data.content[0]);
  };

  const loadItem = async (item) => {
    setCurrentItem(item);

    if (item.type === "lesson") {
      const lesson = await fetchLesson(courseId, item._id);
      setCurrentData(lesson);
    } else {
      const quiz = await fetchQuiz(courseId, item._id);
      setCurrentData(quiz);
    }
  };

  return (
    <div className="flex h-screen">
      <ContentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        contentItems={contentItems}
        currentItem={currentItem}
        progress={progress}
        onSelectItem={loadItem}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {currentItem?.type === "lesson" && (
          <LessonContent
            materials={currentData?.materials}
            title={currentData?.title}
            description={currentData?.description}
          />
        )}

        {currentItem?.type === "quiz" && (
          <QuizTaker
            quiz={currentData}
            courseId={courseId}
            quizId={currentItem?._id}
          />
        )}
      </main>
    </div>
  );
}