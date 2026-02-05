import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../Context/AuthContext";

const WelcomeBanner = () => {
    const { user } = useAuth();
    console.log("Auth user in WelcomeBanner:", user);
  const [stats, setStats] = useState({
    courses: 0,
    completed: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/students/dashboard-stats");
        
        if (response.data.success) {
          setStats({
            courses: response.data.stats.enrolledCourses || 0,
            completed: response.data.stats.completedCourses || 0,
            certificates: response.data.stats.certificates || 0
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Check if user is new (no enrolled courses)
  const isNewUser = stats.courses === 0;

  if (loading) {
    return (
      <div 
        className="p-2 md:p-6 flex flex-col md:flex-row justify-between items-center"
        style={{
          background: "linear-gradient(135deg, #c7d2fe 0%, #d9f99d 100%)"
        }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0 animate-pulse">
          Welcome Back, {user?.name || "Student"}!
        </h2>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          <div className="bg-white/80 px-6 py-3 rounded-lg shadow animate-pulse">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
          <div className="bg-white/80 px-6 py-3 rounded-lg shadow animate-pulse">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
          <div className="bg-white/80 px-6 py-3 rounded-lg shadow animate-pulse">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-3 h-24 md:p-6 flex flex-col md:flex-row justify-between items-center"
      style={{
        background: "linear-gradient(135deg, #c7d2fe 0%, #d9f99d 100%)"
      }}
    >
      {/* Left: Welcome - Different message for new users */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
          {isNewUser ? `Welcome, ${user?.name || "New Student"}!` : `Welcome Back, ${user?.name || "Student"}!`}
        </h2>
        <p className="text-gray-700">
          {isNewUser 
            ? "Ready to start your learning journey?" 
            : "Continue your learning progress"}
        </p>
      </div>

      {/* Right stats */}
      <div className="flex flex-wrap gap-2 md:gap-4">
        {isNewUser ? (
          // Get Started card for new users
          <div className="bg-white px-3 py-1 rounded-lg shadow border-2 border-blue-300">
            <p className="font-bold text-blue-600 flex items-center gap-2 pt-2">
              <span>🚀</span>
              Get Started
            </p>
            <p className="text-sm text-gray-600 mt-1">Enroll in your first course</p>
          </div>
        ) : (
          // Regular stats cards for existing users
          <>
            {/* Courses Card - Always show if user has enrolled */}
            {stats.courses > 0 && (
              <div className="bg-white px-6 py-2 items-center rounded-lg shadow">
                <p className="font-bold pt-2">Courses: {stats.courses}</p>
              </div>
            )}
            
            {/* Completed Card - Only show if completed > 0 */}
            {stats.completed > 0 && (
              <div className="bg-white px-6 py-2 rounded-lg shadow">
                <p className="font-bold pt-2">Completed: {stats.completed}</p>
              </div>
            )}
            
            {/* Certificates Card - Only show if certificates > 0 */}
            {stats.certificates > 0 && (
              <div className="bg-white px-6 py-2 rounded-lg shadow">
                <p className="font-bold pt-2">Certificates: {stats.certificates}</p>
              </div>
            )}
            
            {/* If user has courses but nothing completed or certified */}
            {stats.courses > 0 && stats.completed === 0 && stats.certificates === 0 && (
              <div className="bg-white px-6 py-2 rounded-lg shadow text-center">
                <p className="font-bold text-green-600 pt-2">Start Learning!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;