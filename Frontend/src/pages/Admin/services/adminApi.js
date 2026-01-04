import axiosInstance from "../../../utils/axiosInstance";

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
