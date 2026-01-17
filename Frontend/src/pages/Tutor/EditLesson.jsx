import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Link, 
  Video, 
  Trash2,
  Upload,
  File
} from "lucide-react";
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
  const [newMaterial, setNewMaterial] = useState({
    type: "document",
    name: "",
    url: "",
    file: null
  });

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

  const handleNewMaterialChange = (field, value) => {
    setNewMaterial({ ...newMaterial, [field]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMaterial({
        ...newMaterial,
        file: file,
        name: file.name,
        url: URL.createObjectURL(file)
      });
    }
  };

  const addMaterial = () => {
    if (newMaterial.type === "link" && !newMaterial.url.trim()) {
      setError("Please enter a URL for link materials");
      return;
    }

    if (newMaterial.type !== "link" && !newMaterial.file) {
      setError("Please select a file for document/video materials");
      return;
    }

    const material = {
      type: newMaterial.type,
      name: newMaterial.name || `Material ${lessonData.materials.length + 1}`,
      url: newMaterial.type === "link" ? newMaterial.url : "",
      file: newMaterial.type !== "link" ? newMaterial.file : null
    };

    setLessonData(prev => ({
      ...prev,
      materials: [...prev.materials, material]
    }));

    // Reset new material form
    setNewMaterial({
      type: "document",
      name: "",
      url: "",
      file: null
    });
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

    if (!lessonData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!lessonData.order) {
      setError("Order is required");
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

      // Add existing materials
      lessonData.materials.forEach((m, i) => {
        fd.append(`materials[${i}][type]`, m.type);
        fd.append(`materials[${i}][name]`, m.name || "Material");
        if (m.url) fd.append(`materials[${i}][url]`, m.url);
        if (m.file) fd.append(`materials[${i}][file]`, m.file);
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

  const getMaterialIcon = (type) => {
    switch(type) {
      case "video": return <Video className="w-4 h-4" />;
      case "link": return <Link className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Lesson</h1>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lesson Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Lesson Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title *
            </label>
            <input
              name="title"
              value={lessonData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter lesson title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={lessonData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Lesson description"
            />
          </div>

          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order *
            </label>
            <input
              type="number"
              name="order"
              value={lessonData.order}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={1}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Determines display order</p>
          </div>
        </div>

        {/* Materials Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Lesson Materials ({lessonData.materials.length})
            </h2>
          </div>

          {/* Add New Material */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Add New Material</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newMaterial.type}
                    onChange={(e) => handleNewMaterialChange("type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                {newMaterial.type === "link" ? (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={newMaterial.url}
                      onChange={(e) => handleNewMaterialChange("url", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File
                    </label>
                    <label className="flex items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50">
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {newMaterial.file ? newMaterial.file.name : "Choose file"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept={newMaterial.type === "video" ? "video/*" : "*"}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Name
                </label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => handleNewMaterialChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter material name"
                />
              </div>

              <button
                type="button"
                onClick={addMaterial}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Add Material
              </button>
            </div>
          </div>

          {/* Existing Materials */}
          {lessonData.materials.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No materials added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonData.materials.map((m, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      {getMaterialIcon(m.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {m.name || "Unnamed Material"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {m.type}
                        </span>
                        {m.url && (
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Open resource
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
            {updating ? "Updating..." : "Update Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
}