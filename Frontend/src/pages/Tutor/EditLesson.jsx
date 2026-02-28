import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Loader2 } from "lucide-react";

export default function EditLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    duration: "",
    materials: [],
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     FETCH LESSON
  ========================= */

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axiosInstance.get(`/lessons/${lessonId}`);
        const lesson = res.data.lesson;

        console.log("Loaded lesson:", lesson);

        setLessonData({
          title: lesson.title,
          description: lesson.description || "",
          duration: lesson.duration || "",
          materials: lesson.materials.map((m) => ({
            ...m,
            _id: m._id,
            type: m.type,
            name: m.name || "",
            url: m.url || "",
            description: m.description || "",
            isPreview: m.isPreview || false,
            file: null, // New file to upload (if any)
          })),
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  /* =========================
     HANDLERS
  ========================= */

  const handleChange = (e) => {
    setLessonData({ ...lessonData, [e.target.name]: e.target.value });
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...lessonData.materials];
    updated[index][field] = value;

    // reset file when type changes
    if (field === "type") {
      updated[index].file = null;
    }

    setLessonData({ ...lessonData, materials: updated });
  };

  const handleFileChange = (index, file) => {
    if (!file) return;

    const updated = [...lessonData.materials];
    updated[index].file = file;
    updated[index].name = file.name;

    setLessonData({ ...lessonData, materials: updated });
  };

  const addMaterial = () => {
    setLessonData({
      ...lessonData,
      materials: [
        ...lessonData.materials,
        {
          type: "video",
          name: "",
          url: "",
          description: "",
          isPreview: false,
          file: null,
        },
      ],
    });
  };

  const removeMaterial = (index) => {
    const updated = lessonData.materials.filter((_, i) => i !== index);
    setLessonData({ ...lessonData, materials: updated });
  };

  /* =========================
     SUBMIT
  ========================= */

const handleSubmit = async (e) => {
  e.preventDefault();
  setUpdating(true);
  setError("");

  try {
    if (!lessonData.title || !lessonData.duration) {
      setError("Title and duration are required");
      setUpdating(false);
      return;
    }

    if (!lessonData.materials.length) {
      setError("At least one material is required");
      setUpdating(false);
      return;
    }

    const fd = new FormData();

    fd.append("title", lessonData.title);
    fd.append("description", lessonData.description);
    fd.append("duration", lessonData.duration);

    // Prepare clean materials JSON
    const materialsData = lessonData.materials.map((m) => ({
      _id: m._id || null,   // preserve existing ID
      type: m.type,
      name: m.name,
      description: m.description,
      url: m.file ? "" : m.url, // if new file, ignore old URL
      isPreview: m.isPreview,
    }));

    fd.append("materials", JSON.stringify(materialsData));

    // Append files separately (order matters)
    lessonData.materials.forEach((m) => {
      if (m.file) {
        fd.append("files", m.file);
      }
    });

    console.log("Updating lesson...");
    console.log("Materials JSON:", materialsData);
    console.log("Files:", lessonData.materials.filter(m => m.file));

    await axiosInstance.put(`/lessons/${lessonId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    navigate(-1);

  } catch (err) {
    console.error("Update error:", err);
    setError(err.response?.data?.message || "Update failed");
  } finally {
    setUpdating(false);
  }
};
  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-8 border">

        <h1 className="text-3xl font-bold text-gray-800">
          Edit Lesson
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title *
              </label>
              <input
                name="title"
                value={lessonData.title}
                onChange={handleChange}
                placeholder="Lesson Title"
                className="w-full border p-3 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Description
              </label>
              <textarea
                name="description"
                value={lessonData.description}
                onChange={handleChange}
                placeholder="Lesson Description"
                rows={3}
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={lessonData.duration}
                onChange={handleChange}
                placeholder="Duration (minutes)"
                min="1"
                className="w-full border p-3 rounded-lg"
                required
              />
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Lesson Materials
            </h3>

            {lessonData.materials.map((m, i) => (
              <div
                key={i}
                className="border rounded-xl p-5 bg-gray-50 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">
                    Material {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Type
                  </label>
                  <select
                    value={m.type}
                    onChange={(e) =>
                      handleMaterialChange(i, "type", e.target.value)
                    }
                    className="w-full border p-2 rounded-lg"
                  >
                    <option value="video">Video (Upload or URL)</option>
                    <option value="document">Document</option>
                    <option value="link">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Name
                  </label>
                  <input
                    value={m.name}
                    onChange={(e) =>
                      handleMaterialChange(i, "name", e.target.value)
                    }
                    placeholder="Material name"
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    value={m.description}
                    onChange={(e) =>
                      handleMaterialChange(i, "description", e.target.value)
                    }
                    placeholder="Brief description"
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {m.type === "link" ? "URL *" : "URL (Optional)"}
                  </label>
                  <input
                    value={m.url}
                    onChange={(e) =>
                      handleMaterialChange(i, "url", e.target.value)
                    }
                    placeholder="https://example.com"
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                {/* File Upload (Not for links) */}
                {m.type !== "link" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload New File (Optional)
                    </label>
                    <input
                      type="file"
                      accept={
                        m.type === "video"
                          ? "video/*"
                          : ".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      }
                      onChange={(e) =>
                        handleFileChange(i, e.target.files[0])
                      }
                      className="w-full"
                    />
                    {m.file && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ New file selected: {m.file.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Show current file/URL */}
                {m.url && !m.file && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                    <p className="text-gray-700 font-medium mb-1">Current Material:</p>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {m.url.length > 60 ? m.url.substring(0, 60) + '...' : m.url}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a new file above to replace this
                    </p>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={m.isPreview || false}
                    onChange={(e) =>
                      handleMaterialChange(i, "isPreview", e.target.checked)
                    }
                  />
                  <span className="text-gray-700">
                    Make this a free preview
                  </span>
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addMaterial}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Add Another Material
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Lesson"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}