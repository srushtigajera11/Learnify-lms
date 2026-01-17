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
  });

  const [materials, setMaterials] = useState([
    { type: "document", file: null, url: "", name: "New Material", preview: null },
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleMaterialFileChange = (index, file) => {
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
      { type: "document", file: null, url: "", name: "", preview: null },
    ]);
  };

  const removeMaterial = (index) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("order", formData.order);
      fd.append("courseId", courseId);
      fd.append("materialCount", materials.length);

      materials.forEach((m, i) => {
        fd.append(`materials[${i}][type]`, m.type);
        fd.append(`materials[${i}][name]`, m.name || "Material");

        if (m.type === "link") {
          fd.append(`materials[${i}][url]`, m.url);
        } else if (m.file) {
          fd.append(`materials[${i}][file]`, m.file);
        }
      });

      await axiosInstance.post(`/lessons/${courseId}/add-lesson`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Lesson created successfully!");
      setFormData({ title: "", description: "", order: "" });
      setMaterials([{ type: "document", file: null, url: "", name: "New Material" }]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Add New Lesson</h1>
      </div>

      {error && (
        <div className="rounded-lg p-4 text-sm border bg-red-50 text-red-700 border-red-200 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg p-4 text-sm border bg-green-50 text-green-700 border-green-200 mb-4">
          {success}
        </div>
      )}

      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-xl shadow-sm border border-gray-200 space-y-4 p-6"
      >
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Lesson title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Lesson description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <input
          name="order"
          type="number"
          value={formData.order}
          onChange={handleChange}
          placeholder="Order"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Materials */}
        <div className="space-y-3">
          <h3 className="font-semibold">Lesson Materials</h3>

          {materials.map((m, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <select
                  value={m.type}
                  onChange={(e) => handleMaterialChange(i, "type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                </select>

                {m.type === "link" ? (
                  <input
                    value={m.url}
                    onChange={(e) => handleMaterialChange(i, "url", e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 col-span-2"
                  />
                ) : (
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer text-center col-span-2">
                    {m.file ? m.file.name : `Upload ${m.type}`}
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleMaterialFileChange(i, e.target.files[0])
                      }
                    />
                  </label>
                )}
              </div>

              {m.preview && (
                <video controls className="w-full max-w-md rounded">
                  <source src={m.preview} />
                </video>
              )}

              <button
                type="button"
                onClick={() => removeMaterial(i)}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={materials.length === 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button 
            type="button" 
            onClick={addMaterial}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full"
          >
            + Add Material
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>

          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLessonForm;