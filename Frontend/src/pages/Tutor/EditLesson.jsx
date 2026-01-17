import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function EditLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    order: "",
    materials: [],
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------- FETCH LESSON ---------------- */
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/lessons/lesson/${lessonId}`);
        if (res.data?.lesson) {
          setLessonData({
            title: res.data.lesson.title || "",
            description: res.data.lesson.description || "",
            order: res.data.lesson.order || "",
            materials: res.data.lesson.materials || [],
          });
        } else {
          setError("Failed to load lesson");
        }
      } catch {
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setLessonData({ ...lessonData, [e.target.name]: e.target.value });
    setError("");
  };

  const removeMaterial = (index) => {
    setLessonData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lessonData.title.trim() || !lessonData.order) {
      setError("Title and order are required");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      fd.append("title", lessonData.title);
      fd.append("description", lessonData.description);
      fd.append("order", lessonData.order);

      lessonData.materials.forEach((m, i) => {
        fd.append(`materials[${i}][type]`, m.type);
        fd.append(`materials[${i}][name]`, m.name || "Material");
        if (m.url) fd.append(`materials[${i}][url]`, m.url);
      });

      await axiosInstance.put(`/lessons/lesson/${lessonId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Lesson updated successfully");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading lesson...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Edit Lesson</h1>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lesson Details */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Lesson Title
            </label>
            <input
              name="title"
              value={lessonData.title}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={lessonData.description}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Lesson description"
            />
          </div>

          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-1">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={lessonData.order}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              min={1}
            />
          </div>
        </div>

        {/* Materials */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">
            Materials ({lessonData.materials.length})
          </h2>

          {lessonData.materials.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No materials added
            </p>
          ) : (
            <div className="space-y-3">
              {lessonData.materials.map((m, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start gap-4 border rounded-lg p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {m.name || "Unnamed Material"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.type}
                    </p>

                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open resource
                      </a>
                    )}

                    {m.type === "video" && m.url && (
                      <video
                        src={m.url}
                        controls
                        className="mt-2 w-full max-w-sm rounded-lg"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border px-6 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={updating}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
}
