// frontend/src/pages/admin/services/adminApi.js
import axiosInstance from "../../../utils/axiosInstance";

// Your existing functions...
export const fetchAdminDashboardData = () =>
  Promise.all([
    axiosInstance.get("/admin/courses"),
    axiosInstance.get("/admin/users"),
    axiosInstance.get("/admin/stats"),
    axiosInstance.get("/admin/courses/pending"),
    axiosInstance.get("/admin/enrollments"),
    axiosInstance.get("/admin/payments"),
  ]);

export const approveCourse = (id) =>
  axiosInstance.put(`/admin/course/${id}/approve`);

export const rejectCourse = (id, feedback) =>
  axiosInstance.put(`/admin/course/${id}/reject`, { feedback });

export const updateCourseStatus = (id, status) =>
  axiosInstance.put(`/admin/course/${id}/status`, { status });

export const blockUnblockUser = async (userId, block = true) => {
  return axiosInstance.put(`/admin/user/${userId}/block`, { block });
};

// ===== NEW FUNCTIONS =====

// In your adminApi.js, temporarily return mock data
export const fetchActivityLogs = async (params = {}) => {
  try {
    console.log('Fetching activity logs with params:', params);
    
    // Try real API first
    const response = await axiosInstance.get("/admin/activity-logs", { params });
    console.log('Real API response:', response.data);
    return response;
  } catch (error) {
    console.log('API failed, using mock data:', error.message);
    
    // Return mock data if API fails
    return {
      data: {
        success: true,
        logs: [
          {
            _id: '1',
            adminId: { email: 'admin@learnify.com' },
            action: 'USER_BLOCKED',
            targetType: 'user',
            targetName: 'john@example.com',
            ipAddress: '192.168.1.1',
            timestamp: new Date().toISOString()
          },
          {
            _id: '2',
            adminId: { email: 'admin@learnify.com' },
            action: 'COURSE_APPROVED',
            targetType: 'course',
            targetName: 'React Fundamentals',
            ipAddress: '192.168.1.1',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      }
    };
  }
};

// Export
// frontend/src/pages/admin/services/adminApi.js - FIX EXPORT FUNCTIONS
// Your routes show these endpoints:
export const exportUsersCSV = () =>
  axiosInstance.get("/admin/export/users", { 
    responseType: 'blob' 
  });

export const exportCoursesCSV = () =>
  axiosInstance.get("/admin/export/courses", { 
    responseType: 'blob' 
  });

// Dashboard Charts Data
export const fetchDashboardCharts = () =>
  axiosInstance.get("/admin/dashboard-stats"); 
// In your adminApi.js, temporarily return mock data

// Bulk Operations
export const bulkUpdateUsers = (userIds, action) =>
  axiosInstance.post("/admin/users/bulk", { userIds, action });

export const bulkUpdateCourses = (courseIds, action) =>
  axiosInstance.post("/admin/courses/bulk", { courseIds, action });

// Search with filters
export const searchUsers = (filters) =>
  axiosInstance.get("/admin/users/search", { params: filters });

export const searchCourses = (filters) =>
  axiosInstance.get("/admin/courses/search", { params: filters });