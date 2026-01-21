import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  BookOpen, 
  Download,
  Hourglass,
  AlertCircle,
  MoreVertical,
  FileText,
  BarChart
} from 'lucide-react';
import { approveCourse, rejectCourse } from '../services/adminApi';
import RejectCourseDialog from './RejectCourseDialog';

const EnhancedPendingCourses = ({ courses = [], refresh }) => {
  const [rejectingCourse, setRejectingCourse] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);

  const getCourseProgress = (course) => {
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

  const handleRejectClick = (course) => {
    setRejectingCourse(course);
  };

  const handlePreview = (courseId) => {
    window.open(`/course/preview/${courseId}`, '_blank');
  };

  const getStatusColor = (progress) => {
    if (progress > 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (progress > 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const toggleExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Minimal Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Reviews
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {courses.length} course{courses.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <BarChart className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Courses Grid - Minimal Design */}
        <div className="grid gap-3">
          {courses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">All reviewed</h3>
              <p className="text-gray-500 text-sm">
                No pending course reviews
              </p>
            </div>
          ) : (
            courses.map((course) => {
              const progress = getCourseProgress(course);
              const submittedDate = new Date(course.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <div 
                  key={course._id} 
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="p-4">
                    {/* Compact Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {course.title || "Untitled Course"}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(progress)}`}>
                            {progress}%
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {course.createdBy?.name || "Unknown"}
                          </span>
                          <span>•</span>
                          <span>{submittedDate}</span>
                          <span>•</span>
                          <span>{course.totalLessons || 0} lessons</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleExpand(course._id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-2"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Minimal Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            progress > 80 ? 'bg-emerald-500' : 
                            progress > 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedCourse === course._id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {course.category && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {course.category}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                            ${course.price || 0}
                          </span>
                        </div>
                        
                        {course.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Compact Actions */}
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2">
                        {/* <button
                          onClick={() => handlePreview(course._id)}
                          className="text-sm text-gray-600 hover:text-blue-600 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </button> */}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectClick(course)}
                          className="text-sm text-gray-600 hover:text-rose-600 px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors border border-gray-200 hover:border-rose-200"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(course._id)}
                          className="text-sm bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      {rejectingCourse && (
        <RejectCourseDialog
          course={rejectingCourse}
          onClose={() => setRejectingCourse(null)}
          refresh={refresh}
        />
      )}
    </>
  );
};

export default EnhancedPendingCourses;