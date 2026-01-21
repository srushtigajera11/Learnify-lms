import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    load();
  }, [courseId]);

  const load = async () => {
    const lessonsRes = await axiosInstance.get(
      `/students/course/${courseId}/lessons`
    );
    setLessons(lessonsRes.data.lessons);

    const progressRes = await axiosInstance.get(`/progress/${courseId}`);
    setProgress(progressRes.data.progress?.completedLessons || []);
  };

  const isCompleted = (id) =>
    progress.some((p) => p.lessonId === id || p.lessonId?._id === id);

  const markComplete = async (lessonId) => {
    await axiosInstance.post(
      `/progress/${courseId}/lessons/${lessonId}/complete`
    );
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Course Content</h2>

      {lessons.map((lesson) => (
        <div
          key={lesson._id}
          className="bg-white p-4 rounded shadow mb-3"
        >
          <div className="flex justify-between">
            <h3 className="font-semibold">{lesson.title}</h3>
            {isCompleted(lesson._id) && (
              <CheckCircleIcon className="text-green-500" />
            )}
          </div>

          {!isCompleted(lesson._id) && (
            <button
              onClick={() => markComplete(lesson._id)}
              className="mt-3 px-3 py-1 border border-green-500 text-green-600 rounded"
            >
              Mark Complete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CourseDetail;
