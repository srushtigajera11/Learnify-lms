import { useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import AdminNavbar from "./components/AdminNavbar";
import AdminStats from "./components/AdminStats";
import PendingCourses from "./components/PendingCourses";
import EnrollmentTable from "./components/EnrollmentTable";
import PaymentTable from "./components/PaymentTable";
import CourseList from "./components/CourseList";
import UserList from "./components/UserList";
import { fetchAdminDashboardData } from "./services/adminApi";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await fetchAdminDashboardData();
      setData({
        courses: res[0].data,
        users: res[1].data,
        stats: res[2].data,
        pending: res[3].data,
        enrollments: res[4].data,
        payments: res[5].data,
      });
    } catch {
      setError("Failed to load admin data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <CircularProgress sx={{ mt: 6 }} />;

  return (
    <>
      <AdminNavbar />
      <Box sx={{ p: 4, bgcolor: "#f9fafb" }}>
        <AdminStats stats={data.stats} />
        <PendingCourses courses={data.pending} refresh={load} />
        <EnrollmentTable rows={data.enrollments} />
        <PaymentTable rows={data.payments} />
        <CourseList courses={data.courses} refresh={load} />
        <UserList users={data.users} />
      </Box>
    </>
  );
};

export default AdminDashboard;
