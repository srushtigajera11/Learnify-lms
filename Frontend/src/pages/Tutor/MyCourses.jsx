import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { FavoriteBorder, Delete, Visibility, Add, Category, MonetizationOn, Person } from '@mui/icons-material';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
  const navigate = useNavigate();

  const handleDeleteClick = (course) => setDeleteDialog({ open: true, course });
  const handleDeleteCancel = () => setDeleteDialog({ open: false, course: null });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.course) return;
    try {
      await axiosInstance.delete(`/courses/${deleteDialog.course._id}`);
      setCourses(prev => prev.filter(c => c._id !== deleteDialog.course._id));
      setDeleteDialog({ open: false, course: null });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/courses/my-course');
      if (Array.isArray(res.data)) setCourses(res.data);
      else setError('Invalid data format received from server');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  if (loading)
    return <div className="flex justify-center items-center min-h-[400px]"><div className="loader">Loading...</div></div>;

  if (error)
    return <div className="mt-10 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Courses ({courses.length})</h2>
        <button
          className="bg-indigo-600 hover:bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-1"
          onClick={() => navigate('/tutor/create-course')}
        >
          <Add /> Create New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">You haven't created any courses yet</p>
          <button
            className="mt-4 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1"
            onClick={() => navigate('/tutor/create-course')}
          >
            <Add /> Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map(course => (
            <div key={course._id} className="bg-black border rounded shadow-sm flex flex-col hover:shadow-lg transition-transform duration-200 hover:-translate-y-1">
              {/* Thumbnail */}
              <div className="relative h-40 overflow-hidden rounded-t">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                    No Thumbnail
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs text-white px-2 py-1 rounded ${course.status === 'published' ? 'bg-green-600' : 'bg-gray-400'}`}>
                  {course.status?.toUpperCase() || 'DRAFT'}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold line-clamp-2">{course.title || 'Untitled Course'}</h3>

                  <div className="mt-2 space-y-1 text-gray-600 text-xs">
                    <div className="flex items-center gap-1"><Category fontSize="small" /> {course.category || 'Uncategorized'}</div>
                    <div className="flex items-center gap-1"><MonetizationOn fontSize="small" /> {course.price > 0 ? `₹${course.price.toFixed(2)}` : 'Free'}</div>
                    <div className="flex items-center gap-1"><Person fontSize="small" /> {course.createdBy?.name || 'You'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-between">
                  <button onClick={() => navigate(`/tutor/course/${course._id}`)} className="text-blue-600 hover:text-blue-800">
                    <Visibility />
                  </button>
                  <button onClick={() => handleDeleteClick(course)} className="text-red-600 hover:text-red-800">
                    <Delete />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Course</h3>
            <p>Are you sure you want to delete "{deleteDialog.course?.title}"? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={handleDeleteCancel} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
