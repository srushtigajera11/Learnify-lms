import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, FileText, Video, LinkIcon, Eye, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const ViewLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/lessons/course/${courseId}`);
        setLessons(res.data.lessons || []);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError(err.response?.data?.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  const handleDelete = async (lessonId) => {
    const confirm = window.confirm("Are you sure you want to delete this lesson? This action cannot be undone.");
    if (!confirm) return;

    try {
      await axiosInstance.delete(`/lessons/lesson/${lessonId}`);
      // Remove from state
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete the lesson. Please try again.");
    }
  };

  const getMaterialIcon = (type) => {
    switch(type) {
      case "video": return <Video className="w-4 h-4 text-red-500" />;
      case "link": return <LinkIcon className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lessons Management</h1>
          <p className="text-gray-600 mt-1">Manage and organize your course lessons</p>
        </div>
        <button
          onClick={() => navigate(`/tutor/course/${courseId}/lessons/add`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Lesson
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No lessons yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start by adding your first lesson to organize your course content
          </p>
          <button
            onClick={() => navigate(`/tutor/course/${courseId}/lessons/add`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Your First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Lesson Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold">{lesson.order}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Order: {lesson.order}
                        </span>
                      </div>
                      {lesson.description && (
                        <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                      )}
                      
                      {/* Materials Summary */}
                      {lesson.materials && lesson.materials.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs text-gray-500">Materials:</span>
                          <div className="flex flex-wrap gap-2">
                            {lesson.materials.slice(0, 3).map((material, index) => (
                              <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                {getMaterialIcon(material.type)}
                                <span className="text-gray-700">{material.type}</span>
                              </div>
                            ))}
                            {lesson.materials.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{lesson.materials.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/tutor/course/${courseId}/lesson/${lesson._id}/edit`)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    title="Edit lesson"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lesson._id)}
                    className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    title="Delete lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  <button
                    onClick={() => navigate(`/lesson/${lesson._id}`)}
                    className="px-3 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
                    title="Preview lesson"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {lessons.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Lessons</p>
                <p className="text-xl font-bold text-gray-900">{lessons.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Materials</p>
                <p className="text-xl font-bold text-gray-900">
                  {lessons.reduce((acc, lesson) => acc + (lesson.materials?.length || 0), 0)}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/tutor/course/${courseId}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              ← Back to Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewLessons;