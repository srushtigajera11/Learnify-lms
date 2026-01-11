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

export const fetchActivityLogs = (params = {}) => 
  axiosInstance.get("/admin/activity-logs", { params });

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