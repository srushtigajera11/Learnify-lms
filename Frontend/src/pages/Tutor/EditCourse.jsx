import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const statusStyles = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    category: "",
    price: 0,
    thumbnail: "",
    objectives: "",
    requirements: "",
    level: "beginner",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const isLocked = formData.status === "pending" || formData.status === "published";

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await axiosInstance.get(`/courses/mine/${courseId}`);
      const c = res.data;

      setFormData({
        title: c.title,
        description: c.description,
        status: c.status,
        category: c.category,
        price: c.price,
        level: c.level || "beginner",
        objectives: c.objectives?.join("\n") || "",
        requirements: c.requirements?.join("\n") || "",
      });

      setThumbnailPreview(c.thumbnail);
      setAdminFeedback(c.adminFeedback || "");
    } catch {
      setError("Failed to load course");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Invalid image file");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const saveCourse = async (submit = false) => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    if (submit && (!thumbnailPreview || !formData.category)) {
      setError("Thumbnail and category required for submission");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (!["objectives", "requirements"].includes(key)) {
          fd.append(key, val);
        }
      });

      formData.objectives.split("\n").forEach(o => o.trim() && fd.append("objectives", o));
      formData.requirements.split("\n").forEach(r => r.trim() && fd.append("requirements", r));

      if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

      await axiosInstance.put(`/courses/mine/${courseId}`, fd);

      if (submit) {
        await axiosInstance.put(`/courses/${courseId}/submit`);
        setSuccess("Course submitted for review");
      } else {
        setSuccess("Course saved successfully");
      }

      setTimeout(() => navigate(0), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <span className={`px-3 py-1 rounded-full text-xs ${statusStyles[formData.status]}`}>
            {formData.status}
          </span>
        </div>
      </div>

      {adminFeedback && formData.status === "rejected" && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
          <strong>Admin Feedback:</strong>
          <p className="text-sm">{adminFeedback}</p>
        </div>
      )}

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={isLocked}
            placeholder="Course title"
            className="input"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLocked}
            rows={4}
            placeholder="Course description"
            className="input"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLocked}
            className="input"
          >
            <option value="">Select Category</option>
            {["Web Development","MERN Stack","React","Python"].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <textarea
            name="objectives"
            value={formData.objectives}
            onChange={handleChange}
            rows={3}
            placeholder="Objectives (one per line)"
            className="input"
          />

          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows={3}
            placeholder="Requirements (one per line)"
            className="input"
          />
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="border rounded overflow-hidden">
            {thumbnailPreview ? (
              <img src={thumbnailPreview} className="h-40 w-full object-cover" />
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">
                No Thumbnail
              </div>
            )}
          </div>

          {!isLocked && (
            <label className="block">
              <input type="file" hidden onChange={handleThumbnailChange} />
              <div className="btn-outline w-full text-center cursor-pointer">
                Upload Thumbnail
              </div>
            </label>
          )}

          {!isLocked && (
            <>
              <button
                onClick={() => saveCourse(false)}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              {(formData.status === "draft" || formData.status === "rejected") && (
                <button
                  onClick={() => saveCourse(true)}
                  className="btn-outline w-full"
                >
                  Submit for Review
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
