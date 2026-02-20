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

        setLessonData({
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration || "",
         materials: lesson.materials.map((m) => ({
            ...m,
            file: null,
          })),
        });
      } catch {
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
      const fd = new FormData();

      fd.append("title", lessonData.title);
      fd.append("description", lessonData.description);
      fd.append("duration", lessonData.duration);
      fd.append("materialCount", lessonData.materials.length);

     lessonData.materials.forEach((m, i) => {
  if (m._id) {
    fd.append(`materials[${i}][_id]`, m._id);
  }

  fd.append(`materials[${i}][type]`, m.type);
  fd.append(`materials[${i}][name]`, m.name || "Material");
  fd.append(`materials[${i}][isPreview]`, m.isPreview || false);

  if (m.type === "link") {
    fd.append(`materials[${i}][url]`, m.url);
  }

  if (m.file) {
    fd.append(`materials[${i}][file]`, m.file);
  } else if (m.url) {
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
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10" />
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
            <input
              name="title"
              value={lessonData.title}
              onChange={handleChange}
              placeholder="Lesson Title"
              className="w-full border p-3 rounded-lg"
              required
            />

            <textarea
              name="description"
              value={lessonData.description}
              onChange={handleChange}
              placeholder="Lesson Description"
              className="w-full border p-3 rounded-lg"
            />

            <input
              type="number"
              name="duration"
              value={lessonData.duration}
              onChange={handleChange}
              placeholder="Duration (minutes)"
              className="w-full border p-3 rounded-lg"
              required
            />
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
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <select
                  value={m.type}
                  onChange={(e) =>
                    handleMaterialChange(i, "type", e.target.value)
                  }
                  className="w-full border p-2 rounded-lg"
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
                    className="w-full border p-2 rounded-lg"
                  />
                ) : (
                  <input
                    type="file"
                    accept={
                      m.type === "video"
                        ? "video/*"
                        : "image/png, image/jpeg"
                    }
                    onChange={(e) =>
                      handleFileChange(i, e.target.files[0])
                    }
                  />
                )}

               {m.url && !m.file && (
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <p className="text-gray-600">Current File:</p>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View File
                    </a>
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
                  Make Free Preview
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addMaterial}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
            >
              + Add Material
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              {updating ? "Updating..." : "Update Lesson"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}