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
    order: "",
    duration : "",
    materials: [],
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  /* =========================
   VALIDATION HELPERS
========================= */

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

const validateURL = (url) => {
  const pattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/gm;
  return pattern.test(url);
};

const validateMaterials = (materials) => {
  for (let i = 0; i < materials.length; i++) {
    const m = materials[i];

    // VIDEO VALIDATION
    if (m.type === "video") {
      if (!m.file && !m.url) {
        return `Video file is required for material ${i + 1}`;
      }

      if (m.file) {
        if (!m.file.type.startsWith("video/")) {
          return `Only video files allowed for material ${i + 1}`;
        }

        if (m.file.size > MAX_VIDEO_SIZE) {
          return `Video size must be under 100MB (Material ${i + 1})`;
        }
      }
    }

    // DOCUMENT VALIDATION
    if (m.type === "document") {
      if (!m.file && !m.url) {
        return `Document file is required for material ${i + 1}`;
      }

      if (m.file) {
        if (m.file.type !== "application/pdf") {
          return `Only PDF files allowed for material ${i + 1}`;
        }

        if (m.file.size > MAX_DOC_SIZE) {
          return `Document size must be under 10MB (Material ${i + 1})`;
        }
      }
    }

    // LINK VALIDATION
    if (m.type === "link") {
      if (!m.url) {
        return `URL is required for material ${i + 1}`;
      }

      if (!validateURL(m.url)) {
        return `Invalid URL format for material ${i + 1}`;
      }
    }
  }

  return null;
};

  /* =========================
     FETCH LESSON
  ========================= */

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axiosInstance.get(`/lessons/${lessonId}`); // ✅ FIXED
        const lesson = res.data.lesson;

        setLessonData({
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          duration: lesson.duration || "",
          materials: lesson.materials.map((m) => ({
            ...m,
            file: null, // existing files don't have file object
          })),
        });
      } catch (err) {
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
    setLessonData({ ...lessonData, materials: updated });
  };

  const handleFileChange = (index, file) => {
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
    
    const materialError = validateMaterials(lessonData.materials); // EditLesson

      if (materialError) {
        setError(materialError);
        setLoading(false); // or setUpdating(false)
        return;
      }
      const fd = new FormData();

      fd.append("title", lessonData.title);
      fd.append("description", lessonData.description);
      fd.append("order", lessonData.order);
      fd.append("duration", lessonData.duration);
      fd.append("materialCount", lessonData.materials.length);

      lessonData.materials.forEach((m, i) => {
        fd.append(`materials[${i}][type]`, m.type);
        fd.append(`materials[${i}][name]`, m.name || "Material");
        fd.append(`materials[${i}][isPreview]`, m.isPreview || false);

        if (m.type === "link") {
          fd.append(`materials[${i}][url]`, m.url);
        }

        if (m.file) {
          fd.append(`materials[${i}][file]`, m.file);
        } else if (m.url) {
          // Keep existing Cloudinary URL
          fd.append(`materials[${i}][url]`, m.url);
        }
      });

      await axiosInstance.put(`/lessons/${lessonId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* =========================
     UI
  ========================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Lesson</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white p-4 rounded border space-y-4">
          <input
            name="title"
            value={lessonData.title}
            onChange={handleChange}
            placeholder="Lesson title"
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="description"
            value={lessonData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border p-2 rounded"
          />

          <input
            type="number"
            name="order"
            value={lessonData.order}
            onChange={handleChange}
            placeholder="Order"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            name="duration"
            value={lessonData.duration}
            onChange={handleChange}
            placeholder="Duration (in minutes)"
            className="w-full border p-2 rounded"
            required
          />

        </div>

        {/* Materials */}
        <div className="space-y-4">
          <h3 className="font-semibold">Materials</h3>

          {lessonData.materials.map((m, i) => (
            <div key={i} className="border p-4 rounded space-y-3">

              <select
                value={m.type}
                onChange={(e) =>
                  handleMaterialChange(i, "type", e.target.value)
                }
                className="w-full border p-2 rounded"
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="link">Link</option>
              </select>

              {m.type === "link" ? (
                <input
                  value={m.url}
                  onChange={(e) =>
                    handleMaterialChange(i, "url", e.target.value)
                  }
                  placeholder="https://example.com"
                  className="w-full border p-2 rounded"
                />
              ) : (
              <input
                type="file"
                accept={
                  m.type === "video"
                    ? "video/*"
                    : m.type === "document"
                    ? "image/png, image/jpeg"
                    : ""
                }
                onChange={(e) => handleFileChange(i, e.target.files[0])}
                />
              )}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={m.isPreview || false}
                  onChange={(e) =>
                    handleMaterialChange(i, "isPreview", e.target.checked)
                  }
                />
                Make this material preview
              </label>

              {m.url && (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm"
                >
                  View current file
                </a>
              )}

              <button
                type="button"
                onClick={() => removeMaterial(i)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addMaterial}
            className="bg-gray-100 px-3 py-2 rounded"
          >
            + Add Material
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {updating ? "Updating..." : "Update Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
}
