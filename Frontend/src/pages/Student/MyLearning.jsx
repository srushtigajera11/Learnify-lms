import React, { useState, useEffect } from "react";
import { PlayArrow, CheckCircle, AccessTime } from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const MyLearning = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
      const response = await axiosInstance.get("/students/ecourses");
      if (response.data.success) {
        setEnrolledCourses(response.data.enrollments);
      }
    } catch (err) {
      setError("Failed to fetch enrolled courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (enrollment) => {
    if (!enrollment.progress || enrollment.progress.length === 0) return 0;
    const completedLessons = enrollment.progress.filter(
      (p) => p.completed
    ).length;
    const totalLessons = enrollment.courseId?.totalLessons || 0;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const handleContinueLearning = (courseId) => {
    navigate(`/student/course/${courseId}/learn`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  const filteredCourses = enrolledCourses.filter((enrollment) => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 mx-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  const tabs = ["All Courses", "In Progress", "Completed", "Not Started"];

  return (
    <div className="px-4 md:px-8 py-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Learning</h1>

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
          </button>
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl text-gray-600 mb-4">
            {activeTab === 0
              ? "You haven't enrolled in any courses yet."
              : "No courses match this filter."}
          </h3>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((enrollment) => {
            const course = enrollment.courseId;
            const progress = calculateProgress(enrollment);
            
            return (
              <div
                key={enrollment._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
              >
                {/* Course Thumbnail */}
                <div className="h-40">
                  <img
                    src={course.thumbnail || "/default-course.jpg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Course Content */}
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description?.substring(0, 100)}...
                  </p>
                  
                  {/* Instructor */}
                  <div className="flex items-center mb-4 text-gray-500 text-sm">
                    <AccessTime className="h-4 w-4 mr-1" />
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