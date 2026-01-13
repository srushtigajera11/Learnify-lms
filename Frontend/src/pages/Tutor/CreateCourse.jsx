import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CourseCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: 0,
    objectives: '',
    requirements: '',
    level: 'beginner',
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const categories = [
    'Web Development',
    'App Development',
    'MERN Stack',
    'React',
    'Communication',
    'Python',
    'UI/UX',
  ];

  const levels = ['beginner', 'intermediate', 'advanced'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const calculateProgress = () => {
    const checks = [
      formData.title.length >= 10,
      formData.description.length >= 50,
      formData.category,
      thumbnailFile,
      formData.price !== null,
      formData.level,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const handleSubmit = async (e, action = 'draft') => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );

      if (thumbnailFile) data.append('thumbnail', thumbnailFile);

      const res = await axiosInstance.post('/courses/', data);
      const courseId = res.data.course._id;

      if (action === 'submit') {
        await axiosInstance.put(`/courses/${courseId}/submit`);
        setMessage('Course created & submitted for approval!');
      } else {
        setMessage('Course saved as draft!');
      }

      setTimeout(() => navigate('/tutor/courses'), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="card">
        <div className="card-header text-xl">🎓 Create New Course</div>

        <div className="card-body space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Setup Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {message && <div className="alert-success">{message}</div>}
          {error && <div className="alert-error">{error}</div>}

          <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="label">Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Minimum 10 characters"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea"
                  placeholder="Minimum 50 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="select"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="select"
                  >
                    {levels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Learning Objectives</label>
                <textarea
                  name="objectives"
                  rows="3"
                  value={formData.objectives}
                  onChange={handleChange}
                  className="textarea"
                />
              </div>

              <div>
                <label className="label">Requirements</label>
                <textarea
                  name="requirements"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleChange}
                  className="textarea"
                />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-3">
              <div className="border rounded-lg overflow-hidden">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500">
                    Thumbnail Preview
                  </div>
                )}
              </div>

              <label className="btn-outline w-full cursor-pointer text-center">
                Upload Thumbnail
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </label>
            </div>
          </form>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={loading}
              className="btn-secondary"
            >
              💾 Save Draft
            </button>

            <button
              onClick={(e) => handleSubmit(e, 'submit')}
              disabled={loading || progress < 70}
              className="btn-primary"
            >
              {loading ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
