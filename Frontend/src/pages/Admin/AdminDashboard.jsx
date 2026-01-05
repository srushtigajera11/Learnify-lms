import { useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import AdminSidebar from "./layout/AdminSidebar";
import AdminStats from "./components/AdminStats";
import PendingCourses from "./components/PendingCourses";
import TabSection from "./components/TabSection";
import CourseList from "./pages/CourseList";
import UserList from "./pages/UserList";
import EnrollmentTable from "./pages/EnrollmentTable";
import PaymentTable from "./pages/PaymentTable";
import { fetchAdminDashboardData } from "./services/adminApi";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("dashboard");
  const [tab, setTab] = useState(0);

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

  if (loading) return <CircularProgress sx={{ mt: 6 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <AdminSidebar selected={section} onSelect={setSection} />

      {/* Content */}
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#f9fafb" }}>
        {section === "dashboard" && (
          <>
            <AdminStats stats={data.stats} />
            <PendingCourses courses={data.pending} refresh={load} />
          </>
        )}

        {section === "courses" && (
          <CourseList courses={data.courses} refresh={load} />
        )}

        {section === "users" && (
          <UserList users={data.users} />
        )}

        {section === "payments" && (
          <PaymentTable rows={data.payments} />
        )}

        {section === "enrollments" && (
          <EnrollmentTable rows={data.enrollments} />
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
