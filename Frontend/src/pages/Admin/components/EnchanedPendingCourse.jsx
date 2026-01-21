import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  BookOpen, 
  Download,
  Hourglass,
  AlertCircle
} from 'lucide-react';
import { approveCourse, rejectCourse } from '../services/adminApi';

const EnhancedPendingCourses = ({ courses = [], refresh }) => {
  const getCourseProgress = (course) => {
    // Calculate completion percentage
    const checks = [
      !!course.title,
      !!course.description,
      !!course.category,
      !!course.thumbnail,
      course.sections?.length > 0,
      course.totalLessons > 0
    ];
    
    const met = checks.filter(Boolean).length;
    return Math.round((met / checks.length) * 100);
  };

  const handleApprove = async (id) => {
    try {
      await approveCourse(id);
      if (refresh) refresh();
    } catch (error) {
      console.error('Error approving course:', error);
    }
  };

  const handleReject = async (id) => {
    const feedbackText = prompt('Please provide rejection feedback:', 
      'Course needs improvement in content quality.');
    
    if (feedbackText) {
      try {
        await rejectCourse(id, feedbackText);
        if (refresh) refresh();
      } catch (error) {
        console.error('Error rejecting course:', error);
      }
    }
  };

  const handlePreview = (courseId) => {
    window.open(`/course/preview/${courseId}`, '_blank');
  };

  const getProgressColor = (progress) => {
    if (progress > 70) return 'bg-green-500';
    if (progress > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Hourglass className="w-6 h-6 text-amber-500" />
            Pending Course Reviews
            {courses.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({courses.length})
              </span>
            )}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Review and approve courses submitted by instructors
          </p>
        </div>
        
        {courses.length > 0 && (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
            {courses.length} waiting
          </span>
        )}
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">All caught up!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              All courses have been reviewed. Check back later for new submissions.
            </p>
          </div>
        ) : (
          courses.map((course) => {
            const progress = getCourseProgress(course);
            const submittedDate = new Date(course.createdAt).toLocaleDateString();
            
            return (
              <div 
                key={course._id} 
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {course.title || "Untitled Course"}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="w-4 h-4 mr-1" />
                        <span>By: {course.createdBy?.name || "Unknown Instructor"}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-2">
                        Submitted: {submittedDate}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                        <BookOpen className="w-4 h-4" />
                        {course.totalLessons || 0} lessons
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Completion Status</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(progress)} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.category && (
                      <span className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg">
                        {course.category}
                      </span>
                    )}
                    
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                      ${course.price || 0}
                    </span>
                    
                    {course.duration && (
                      <span className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-lg flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.round(course.duration)} min
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {course.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      {/* Left Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(course._id)}
                          className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview Course
                        </button>
                        
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download statistics"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(course._id)}
                          className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        
                        <button
                          onClick={() => handleApprove(course._id)}
                          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Summary */}
      {courses.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-medium text-gray-900 mb-4">Review Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {courses.length}
              </div>
              <div className="text-sm text-gray-600">Total Pending</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {courses.filter(c => getCourseProgress(c) > 70).length}
              </div>
              <div className="text-sm text-gray-600">High Quality</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">
                {courses.filter(c => getCourseProgress(c) <= 70 && getCourseProgress(c) > 40).length}
              </div>
              <div className="text-sm text-gray-600">Needs Review</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {courses.filter(c => getCourseProgress(c) <= 40).length}
              </div>
              <div className="text-sm text-gray-600">Incomplete</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPendingCourses;