import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const AddLessonForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
  });

  const [materials, setMaterials] = useState([
    {
      type: "video",
      file: null,
      url: "",
      name: "",
      isPreview: false,
      preview: null,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     HANDLERS
  ========================= */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;

    // reset file if type changes
    if (field === "type") {
      updated[index].file = null;
      updated[index].preview = null;
    }

    setMaterials(updated);
  };

  const handleFileChange = (index, file) => {
    if (!file) return;

    const updated = [...materials];
    updated[index].file = file;
    updated[index].name = file.name;

    if (file.type.startsWith("video/")) {
      updated[index].preview = URL.createObjectURL(file);
    }

    setMaterials(updated);
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        type: "video",
        file: null,
        url: "",
        name: "",
        isPreview: false,
        preview: null,
      },
    ]);
  };

  const removeMaterial = (index) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.title || !formData.duration) {
        setError("Title and Duration are required");
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("duration", formData.duration);
      fd.append("materialCount", materials.length);

      materials.forEach((m, i) => {
        fd.append(`materials[${i}][type]`, m.type);
        fd.append(`materials[${i}][name]`, m.name || "Material");
        fd.append(`materials[${i}][isPreview]`, m.isPreview);

        if (m.type === "link") {
          fd.append(`materials[${i}][url]`, m.url);
        }

        if (m.file) {
          fd.append(`materials[${i}][file]`, m.file);
        }
      });

      await axiosInstance.post(`/lessons/course/${courseId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-8 border">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Lesson
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Add lesson details and learning materials
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Lesson Info */}
          <div className="space-y-4">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Lesson Title"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Lesson Description"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Duration (minutes)"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Materials */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Lesson Materials
            </h3>

            {materials.map((m, i) => (
              <div
                key={i}
                className="border rounded-xl p-5 bg-gray-50 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">
                    Material {i + 1}
                  </span>
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(i)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
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
                    placeholder="https://example.com"
                    value={m.url}
                    onChange={(e) =>
                      handleMaterialChange(i, "url", e.target.value)
                    }
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

                {m.preview && (
                  <video
                    controls
                    src={m.preview}
                    className="w-full max-w-md rounded-lg"
                  />
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={m.isPreview}
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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              {loading ? "Creating..." : "Create Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLessonForm;