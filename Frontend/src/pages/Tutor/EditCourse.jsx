import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null); // New

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/courses/my-course/${courseId}`);
        setCourse(res.data);
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

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('description', course.description);
      formData.append('category', course.category || '');
      formData.append('price', course.price || 0);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      await axiosInstance.put(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Course updated successfully');
      navigate('/tutor/courses');
    } catch (err) {
      console.error('Update Course Error:', err.response?.data || err.message);
      alert('Failed to update course. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96">Loading course...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button onClick={() => navigate('/tutor/courses')} className="text-blue-600 hover:underline">
        ← Back to Courses
      </button>

      <h1 className="text-3xl font-bold">{course.title}</h1>

      <form className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            value={course.title}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={course.description}
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            className="w-full border rounded p-2"
            rows="4"
          />
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            type="text"
            value={course.category || ''}
            onChange={(e) => setCourse({ ...course, category: e.target.value })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            value={course.price || 0}
            onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Thumbnail</label>
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt="Course Thumbnail"
              className="w-48 h-28 object-cover rounded mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
