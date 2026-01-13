// frontend/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
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

  if (loading && !data) return <CircularProgress sx={{ mt: 6 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <AdminSidebar selected={section} onSelect={setSection} />

      {/* Content */}
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#f9fafb" }}>
       {section === "dashboard" && (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h5">Dashboard Overview</Typography>
      <ExportButtons />
    </Box>
    <AdminStats stats={data?.stats || {}} />
        <Box sx={{ mt: 4 }}>
      <EnhancedPendingCourses 
        courses={data?.pending || []} 
        refresh={load} 
      />
    </Box>
  </>
)}


        {section === "courses" && (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h5">Course Management</Typography>
      <ExportButtons />
    </Box>
    <CourseList courses={data?.courses || []} refresh={load} />
  </>
)}

{section === "users" && (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h5">User Management</Typography>
      <ExportButtons />
    </Box>
    <UserList users={data?.users || []} refresh={load} />
  </>
)}

        {section === "payments" && (
          <PaymentTable rows={data?.payments || []} />
        )}

        {section === "enrollments" && (
          <EnrollmentTable rows={data?.enrollments || []} />
        )}

        {/* NEW ACTIVITY LOG SECTION
        {section === "activity" && (
          <ActivityLog />
        )} */}
      </Box>
    </Box>
  );
};

export default AdminDashboard;