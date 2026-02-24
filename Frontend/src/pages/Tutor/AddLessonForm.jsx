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
      description: "",
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
      updated[index].url = "";
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
        description: "",
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

      // Validate materials
      for (let i = 0; i < materials.length; i++) {
        const m = materials[i];
        if (m.type === "link" && !m.url) {
          setError(`Material ${i + 1}: URL is required for link type`);
          setLoading(false);
          return;
        }
        if ((m.type === "video" || m.type === "document") && !m.file && !m.url) {
          setError(`Material ${i + 1}: File or URL is required`);
          setLoading(false);
          return;
        }
      }

      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("duration", formData.duration);
      fd.append("materialCount", materials.length);

      materials.forEach((m, i) => {
        fd.append(`materials[${i}][type]`, m.type);
        fd.append(`materials[${i}][name]`, m.name || m.file?.name || "Material");
        fd.append(`materials[${i}][isPreview]`, m.isPreview);
        
        // Add description
        if (m.description) {
          fd.append(`materials[${i}][description]`, m.description);
        }

        // Add URL (for links OR video URLs)
        if (m.url) {
          fd.append(`materials[${i}][url]`, m.url);
        }

        // Add file
        if (m.file) {
          fd.append(`materials[${i}][file]`, m.file);
        }
      });

      console.log("Submitting lesson with materials:", materials);

      await axiosInstance.post(`/lessons/course/${courseId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(-1);
    } catch (err) {
      console.error("Submit error:", err);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to React Hooks"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What will students learn in this lesson?"
                rows={3}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="15"
                min="1"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
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
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
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
                    placeholder="e.g., Introduction Video, Course Slides"
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
                    placeholder="Brief description of this material"
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                {/* URL Input for Links or Video URLs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {m.type === "link" ? "URL *" : "URL (Optional - for YouTube, Vimeo, etc.)"}
                  </label>
                  <input
                    value={m.url}
                    onChange={(e) =>
                      handleMaterialChange(i, "url", e.target.value)
                    }
                    placeholder="https://example.com or https://youtube.com/..."
                    className="w-full border p-2 rounded-lg"
                  />
                  {m.type === "video" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a YouTube/Vimeo URL OR upload a video file below
                    </p>
                  )}
                </div>

                {/* File Upload (Not for links) */}
                {m.type !== "link" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File {!m.url && "*"}
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
                        ✓ Selected: {m.file.name}
                      </p>
                    )}
                  </div>
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
                  <span className="text-gray-700">
                    Make this a free preview (students can view without enrolling)
                  </span>
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addMaterial}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Another Material
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
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