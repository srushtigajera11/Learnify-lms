import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const MyLearning = () => {
  const navigate = useNavigate();
  
  // STATE DECLARATIONS
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get('/students/enrolled-courses');
      
      console.log('Enrolled courses response:', response.data);
      
      if (response.data.success) {
        setEnrolledCourses(response.data.enrollments || []);
      } else {
        setError(response.data.message || 'Failed to load enrolled courses');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch enrolled courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/student/course/${courseId}/learn`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Learning</h1>
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Learning</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
          <button
            onClick={fetchEnrolledCourses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
        <p className="text-gray-600 mb-6">Continue your learning journey</p>
        
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't enrolled in any courses yet. Start learning today!
              </p>
              <button
                onClick={() => navigate('/student/courses')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Courses
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => (
              <div
                key={enrollment._id}
                onClick={() => handleCourseClick(enrollment.course?._id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {enrollment.course?.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                      <PlayCircle className="h-12 w-12 text-blue-400" />
                    </div>
                  )}
                  
                  {/* Progress Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {enrollment.progress || 0}% Complete
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {enrollment.course?.title || 'Untitled Course'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {enrollment.course?.description || 'No description available'}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-700">
                        {enrollment.course?.createdBy?.name?.[0] || 'I'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {enrollment.course?.createdBy?.name || 'Instructor'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{enrollment.totalLessons || 0} lessons</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      <span>{enrollment.completedLessons || 0} completed</span>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(enrollment.course?._id);
                    }}
                    className="w-full mt-4 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {enrolledCourses.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Learning Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {enrolledCourses.length}
                </div>
                <div className="text-sm text-blue-600">Total Courses</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {enrolledCourses.filter(c => c.progress === 100).length}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">
                  {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length}
                </div>
                <div className="text-sm text-purple-600">In Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;