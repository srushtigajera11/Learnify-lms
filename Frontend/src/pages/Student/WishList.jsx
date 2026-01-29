import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axiosInstance from '../../utils/axiosInstance'; // Import axiosInstance directly

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch wishlist function
  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get('/wishlist');
      console.log('Wishlist API Response:', response.data); // Debug log
      return response.data.wishlist || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  };

  // Remove from wishlist function
  const removeFromWishlist = async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/remove/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchWishlist();
        console.log('Wishlist data:', data); // Debug log
        setWishlist(data || []);
      } catch (err) {
        console.error('Full error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemove = async (courseId) => {
    try {
      await removeFromWishlist(courseId);
      setWishlist((prev) => prev.filter((item) => item.courseId._id !== courseId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          Your wishlist is empty. Start adding courses!
        </div>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          const course = item.courseId;
          
          // Handle cases where course might be null or undefined
          if (!course) {
            console.warn('Invalid course data in wishlist:', item);
            return null;
          }

          return (
            <div
              key={course._id || item._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
            >
              {/* Course Thumbnail */}
              <div className="relative h-48">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title || 'Course image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-thumbnail.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm">No Image</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-4 flex-grow">
                <h3 
                  className="text-lg font-semibold text-gray-800 mb-2 truncate cursor-pointer hover:text-indigo-600"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  {course.title || 'Untitled Course'}
                </h3>
                
                <div className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
                  {course.description || 'No description available'}
                </div>
                
                {/* Course Info */}
                <div className="space-y-2">
                  {course.createdBy?.name && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      By: {course.createdBy.name}
                    </div>
                  )}
                  
                  {course.price !== undefined && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ₹{course.price}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => navigate(`/student/dashboard`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleRemove(course._id)}
                  className="p-2 text-red-500 hover:text-red-600 transition"
                  title="Remove from Wishlist"
                >
                  <FavoriteIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          );
        }).filter(Boolean)} {/* Remove any null entries */}
      </div>
    </div>
  );
};

export default Wishlist;