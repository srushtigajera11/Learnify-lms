import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Clock, 
  XCircle,
  BookOpen,
  User,
  IndianRupee
} from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";

const CourseList = ({ courses: initialCourses, refresh }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState(initialCourses || []); // Add this state

  // Update local courses when prop changes
  useEffect(() => {
    setCourses(initialCourses || []);
  }, [initialCourses]);

const handleStatusChange = async (id, status) => {
  try {
    console.log('Updating status:', { id, status });
    
    // Add optimistic update for better UX
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course._id === id ? { ...course, status } : course
      )
    );

    // CORRECT: Use PUT method and don't double-stringify
    const response = await axiosInstance.put(`/admin/course/${id}/status`, { 
      status 
    });
    
    console.log('Response:', response.data);
    
    // Refresh from server if needed
    if (refresh) refresh();
    
    // Optional: Show success message
    // toast.success(`Status changed to ${status}`);
    
  } catch (error) {
    console.error('Full axios error:', error);
    
    // Log detailed error info
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    
    // Revert optimistic update
    setCourses(initialCourses || []);
    
    // Show user-friendly error
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to update status';
    alert(`Error: ${errorMessage}`);
  }
};

  // Filter courses - update to use local courses state
  const filteredCourses = courses.filter(course => {
    if (!course) return false;
    
    const matchesSearch = 
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.createdBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status configuration
  const statusConfig = {
    draft: { 
      label: "Draft", 
      bgColor: "bg-gray-100", 
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      icon: <EyeOff className="w-4 h-4" />
    },
    pending: { 
      label: "Pending", 
      bgColor: "bg-yellow-100", 
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: <Clock className="w-4 h-4" />
    },
    published: { 
      label: "Published", 
      bgColor: "bg-green-100", 
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: <CheckCircle className="w-4 h-4" />
    },
    rejected: { 
      label: "Rejected", 
      bgColor: "bg-red-100", 
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: <XCircle className="w-4 h-4" />
    }
  };

  return (
    <div className="p-6">
      {/* Header with Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-gray-600" />
            All Courses 
            <span className="text-gray-600 font-normal">({filteredCourses.length})</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage and review all courses in the platform
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex-1 sm:flex-none sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1 sr-only">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No courses found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div 
              key={course._id} 
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
            >
              <div className="p-5 flex-1">
                {/* Course Title */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {course.title || "Untitled Course"}
                </h3>
                
                {/* Instructor & Price */}
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="truncate">
                    {course.createdBy?.name || course.instructor?.name || "Unknown Instructor"}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-800 font-medium mb-4">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  <span>₹{course.price || 0}</span>
                </div>
                
                {/* Current Status Display */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig[course.status]?.bgColor} ${statusConfig[course.status]?.textColor} ${statusConfig[course.status]?.borderColor}`}>
                      {statusConfig[course.status]?.icon}
                      {statusConfig[course.status]?.label || course.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enrollments: {course.enrollmentCount || 0}
                  </p>
                </div>

                {/* Status Change Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Change Status:
                  </label>
                  <select
                    value={course.status || "draft"}
                    onChange={(e) => handleStatusChange(course._id, e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseList;