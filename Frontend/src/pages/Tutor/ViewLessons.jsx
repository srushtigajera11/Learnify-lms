// src/pages/tutor/Courses/ViewLessons.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import axiosInstance from "../../utils/axiosInstance";

const ViewLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await axiosInstance.get(`/lessons/${courseId}`);
        setLessons(res.data.lessons || []);
      } catch (err) {
        console.error("Error fetching lessons:", err);
      }
    };

    fetchLessons();
  }, [courseId]);

  const handleDelete = async (lessonId) => {
    const confirm = window.confirm("Are you sure you want to delete this lesson?");
    if (!confirm) return;

    try {
      await axiosInstance.delete(`/lessons/lesson/${lessonId}`);
      // Remove from state
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete the lesson.");
    }
  };
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lessons</h2>

      <Button className="mb-4" onClick={() => navigate(`/tutor/course/${courseId}/lessons/add`)}>
        ➕ Add Lesson
      </Button>

      {lessons.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="bg-white shadow p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/tutor/course/${courseId}/lesson/${lesson._id}/edit`)}>
                  ✏️ Edit
                </Button>
                <Button variant="destructive" color="error" onClick={() => handleDelete(lesson._id)}>🗑️ Delete</Button> {/* Wire delete logic */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewLessons;
