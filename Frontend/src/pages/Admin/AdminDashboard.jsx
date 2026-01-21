import { useEffect, useState } from "react";
import AdminSidebar from "./layout/AdminSidebar";
import AdminStats from "./components/AdminStats";
import EnhancedPendingCourses from "./components/EnchanedPendingCourse";
import CourseList from "./pages/CourseList";
import UserList from "./pages/UserList";
import EnrollmentTable from "./pages/EnrollmentTable";
import PaymentTable from "./pages/PaymentTable";
import ExportButtons from "./components/ExportButtons";
import { fetchAdminDashboardData } from "./services/adminApi";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("dashboard");

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminDashboardData();

      setData({
        courses: res[0]?.data || [],
        users: res[1]?.data || [],
        stats: res[2]?.data || {},
        pending: res[3]?.data || [],
        enrollments: (res[4]?.data || []).filter(e => e.studentId),
        payments: res[5]?.data || [],
      });
    } catch (err) {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Fixed */}
      <div className="hidden lg:block">
        <AdminSidebar selected={section} onSelect={setSection} />
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-50 p-6">
        {section === "dashboard" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <ExportButtons />
            </div>
            <AdminStats stats={data?.stats || {}} />
            <div className="mt-6">
              <EnhancedPendingCourses 
                courses={data?.pending || []} 
                refresh={load} 
              />
            </div>
          </>
        )}

        {section === "courses" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
              <ExportButtons />
            </div>
            <CourseList courses={data?.courses || []} refresh={load} />
          </>
        )}

        {section === "users" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <ExportButtons />
            </div>
            <UserList users={data?.users || []} refresh={load} />
          </>
        )}

        {section === "payments" && (
          <PaymentTable rows={data?.payments || []} />
        )}

        {section === "enrollments" && (
          <EnrollmentTable rows={data?.enrollments || []} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;