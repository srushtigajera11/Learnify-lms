import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const AddLessonForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: "",
    duration : "",
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
    setMaterials(updated);
  };

  const handleFileChange = (index, file) => {
    if (!file) return;

    const updated = [...materials];
    updated[index].file = file;
    updated[index].name = file.name;
    updated[index].preview = file.type.startsWith("video/")
      ? URL.createObjectURL(file)
      : null;

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
      if (!formData.title || !formData.order) {
        setError("Title and order are required");
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("order", formData.order);
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

      await axiosInstance.post(
        `/lessons/course/${courseId}`,  // ✅ Updated route
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Lesson</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Lesson Info */}
        <div className="bg-white p-4 rounded border space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Lesson title"
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Lesson description"
            className="w-full border p-2 rounded"
          />

          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            placeholder="Order"
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Duration (in minutes)"
            className="w-full border p-2 rounded"
            required
          />

        </div>

        {/* Materials */}
        <div className="space-y-4">
          <h3 className="font-semibold">Materials</h3>

          {materials.map((m, i) => (
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
                  placeholder="https://example.com"
                  value={m.url}
                  onChange={(e) =>
                    handleMaterialChange(i, "url", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              ) : (
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(i, e.target.files[0])
                  }
                />
              )}

              {/* Preview Toggle */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={m.isPreview}
                  onChange={(e) =>
                    handleMaterialChange(i, "isPreview", e.target.checked)
                  }
                />
                Make this material free preview
              </label>

              {m.preview && (
                <video
                  controls
                  src={m.preview}
                  className="w-full max-w-md"
                />
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
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLessonForm;
