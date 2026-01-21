import React, { useState, useEffect } from "react";
import { 
  PlayArrow, 
  CheckCircle, 
  AccessTime,
  Bookmark,
  TrendingUp,
  Star,
  MenuBook,
  Refresh
} from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const MyLearning = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try the endpoint that works with your backend
      const response = await axiosInstance.get("/students/ecourses");
      
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        // Check if we got enrollments or a different structure
        if (response.data.enrollments) {
          setEnrollments(response.data.enrollments);
        } else if (response.data.courses) {
          // If backend returns courses array instead
          setEnrollments(response.data.courses);
        } else {
          setEnrollments([]);
        }
      } else {
        setError(response.data.message || "Failed to load courses");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (enrollment) => {
    // Handle different data structures
    if (enrollment.progress !== undefined) {
      return enrollment.progress || 0;
    }
    
    if (enrollment.completedLessons && enrollment.totalLessons) {
      return enrollment.totalLessons > 0 
        ? Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100) 
        : 0;
    }
    
    return 0;
  };

  const handleContinueLearning = (courseId) => {
    navigate(`/student/course/${courseId}/learn`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const progress = calculateProgress(enrollment);
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return progress > 0 && progress < 100; // In Progress
    if (activeTab === 2) return progress === 100; // Completed
    if (activeTab === 3) return progress === 0; // Not Started
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error && enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <div className="text-red-600 mb-4">
            <h3 className="text-xl font-bold mb-2">Error Loading Courses</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={fetchEnrolledCourses}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <Refresh /> Try Again
          </button>
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const tabs = ["All Courses", "In Progress", "Completed", "Not Started"];

  return (
    <div className="px-4 md:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Learning</h1>
        <button
          onClick={() => navigate("/courses")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Browse More Courses
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === index
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
              {enrollments.filter(enrollment => {
                const progress = calculateProgress(enrollment);
                if (index === 0) return true;
                if (index === 1) return progress > 0 && progress < 100;
                if (index === 2) return progress === 100;
                if (index === 3) return progress === 0;
                return false;
              }).length}
            </span>
          </button>
        ))}
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <MenuBook className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {enrollments.length === 0 
                ? "You haven't enrolled in any courses yet"
                : "No courses match this filter"}
            </h3>
            <p className="text-gray-500 mb-6">
              {enrollments.length === 0
                ? "Start your learning journey by enrolling in courses"
                : "Try selecting a different filter"}
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Browse Courses
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => {
            // Handle different data structures
            const course = enrollment.courseId || enrollment;
            const progress = calculateProgress(enrollment);
            
            if (!course) return null; // Skip if course is undefined

            return (
              <div
                key={enrollment._id || course._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
              >
                {/* Course Thumbnail */}
                <div className="h-48">
                  <img
                    src={course.thumbnail || "/default-course.jpg"}
                    alt={course.title || "Course"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Course Content */}
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {course.title || "Untitled Course"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description?.substring(0, 100) || "No description available"}...
                  </p>
                  
                  {/* Instructor */}
                  <div className="flex items-center mb-4 text-gray-500 text-sm">
                    <span>Instructor: {course.createdBy?.name || "Unknown"}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Progress</span>
                      <span className="font-semibold text-gray-800">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {progress === 100 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </div>
                    )}
                    {progress > 0 && progress < 100 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        <AccessTime className="h-3 w-3" />
                        In Progress
                      </div>
                    )}
                    {progress === 0 && (
                      <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Not Started
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleContinueLearning(course._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <PlayArrow className="h-5 w-5" />
                    {progress === 0 ? "Start Learning" : "Continue"}
                  </button>
                  <button
                    onClick={() => handleViewCourse(course._id)}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearning;