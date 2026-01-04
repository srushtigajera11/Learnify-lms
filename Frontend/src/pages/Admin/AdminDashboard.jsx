import { useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import AdminNavbar from "./components/AdminNavbar";
import AdminStats from "./components/AdminStats";
import PendingCourses from "./components/PendingCourses";
import EnrollmentTable from "./components/EnrollmentTable";
import PaymentTable from "./components/PaymentTable";
import CourseList from "./components/CourseList";
import UserList from "./components/UserList";
import TabSection from "./components/TabSection";
import { fetchAdminDashboardData } from "./services/adminApi";

const AdminDashboard = () => {
  // ✅ All hooks at top level
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0); // always declared, not conditional
  const [loading, setLoading] = useState(true);

  // fetch function
  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminDashboardData();
      setData({
        courses: res[0].data,
        users: res[1].data,
        stats: res[2].data,
        pending: res[3].data,
        enrollments: res[4].data.filter(e => e.studentId), // remove deleted
        payments: res[5].data,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Conditional rendering is okay, hooks must be declared above
  if (loading) return <CircularProgress sx={{ mt: 6 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <AdminNavbar />
      <Box sx={{ p: 4, bgcolor: "#f9fafb" }}>
        <AdminStats stats={data.stats} />
        <PendingCourses courses={data.pending} refresh={load} />
        <TabSection
          tab={tab}
          setTab={setTab}
          enrollments={data.enrollments}
          payments={data.payments}
        />
        <CourseList courses={data.courses} refresh={load} />
        <UserList users={data.users}  />
      </Box>
    </>
  );
};
export default AdminDashboard;