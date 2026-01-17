import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const categories = [
    'Web Development',
    'App Development',
    'MERN Stack',
    'React',
    'Communication',
    'Python',
    'UI/UX',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/courses/my-course/${courseId}`);
        setCourse(res.data);
        if (res.data.thumbnail) {
          setThumbnailPreview(res.data.thumbnail);
        }
      } catch (err) {
        console.error('Fetch Course Error:', err.response?.data || err.message);
        if (err.response?.status === 404) {
          setError('Course not found or you do not have permission.');
        } else {
          setError('Failed to load course. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('title', course.title || '');
      formData.append('description', course.description || '');
      formData.append('category', course.category || 'Web Development');
      formData.append('price', course.price || 0);
      formData.append('level', course.level || 'beginner');
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      await axiosInstance.put(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Course updated successfully!');
      setTimeout(() => {
        navigate('/tutor/courses');
      }, 1500);
    } catch (err) {
      console.error('Update Course Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to discard changes?')) {
      navigate('/tutor/courses');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate('/tutor/courses')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Course</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/tutor/courses')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Courses
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-gray-600 mt-2">Update your course details and thumbnail</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title
          </label>
          <input
            type="text"
            value={course.title || ''}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter course title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={course.description || ''}
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your course"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={course.category || 'Web Development'}
              onChange={(e) => setCourse({ ...course, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={course.price || 0}
              onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={course.level || 'beginner'}
            onChange={(e) => setCourse({ ...course, level: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Thumbnail
          </label>
          
          {/* Current Thumbnail */}
          {thumbnailPreview && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current thumbnail:</p>
              <div className="relative w-full max-w-xs">
                <img
                  src={thumbnailPreview}
                  alt="Course thumbnail"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
              </div>
            </div>
          )}

          {/* Upload New Thumbnail */}
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </label>
          
          {thumbnailFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {thumbnailFile.name}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}