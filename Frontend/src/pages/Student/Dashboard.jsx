import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import StudentDashboardRightSidebar from "./StudentDashboardRightSide";
import LaunchIcon from "@mui/icons-material/Launch";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardCourses = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/students/courses");
        setCourses(res.data.courses || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard courses"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 mx-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 xl:col-span-3">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Dashboard
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                <div className="h-44">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Action */}
                <div className="p-4 border-t">
                  {course.isEnrolled ? (
                    <button
                      onClick={() =>
                        navigate(`/student/course/${course._id}`)
                      }
                      className="w-full  bg-green-600 hover:bg-green-700  text-white py-2 rounded-lg font-medium transition"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        navigate(`/student/course/${course._id}`)
                      }
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <LaunchIcon fontSize="small" />
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            ))}

            
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <StudentDashboardRightSidebar />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
