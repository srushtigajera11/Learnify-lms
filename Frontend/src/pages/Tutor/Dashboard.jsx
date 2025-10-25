import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, Card } from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PendingIcon from "@mui/icons-material/Pending";

import SummaryCard from "../../Layout/TutorDashboardCard";
import EarningsChart from "../../Components/EarningsChart";
import CourseCard from "./CourseCard";
import QuickStatsChart from "../../Components/QuickStatsChart";
import RecentReviews from "../../Components/RecentReviews";
import QuickLinks from "../../Components/QuickLinks";
import axiosInstance from "../../utils/axiosInstance";


const Dashboard = () => {
  const [courses, setCourses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/courses/my-course"); // ✅ same endpoint as old file
      if (Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setError("Invalid data format received from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };
  fetchCourses();
}, []);

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    monthlyEarnings: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/analytics/tutor/stats", {
          withCredentials: true,
        });
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Total Courses"
                value={stats.totalCourses}
                icon={<LibraryBooksIcon sx={{ color: "#1e40af" }} />}
                color="#dbeafe"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Active Students"
                value={stats.totalEnrollments}
                icon={<GroupIcon sx={{ color: "#047857" }} />}
                color="#d1fae5"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Monthly Earnings"
                value={`₹${(stats.monthlyEarnings || 0).toLocaleString()}`}
                icon={<AttachMoneyIcon sx={{ color: "#b45309" }} />}
                color="#fef3c7"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SummaryCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                icon={<PendingIcon sx={{ color: "#b91c1c" }} />}
                color="#fee2e2"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Earnings Overview + Right Widgets */}
<Grid item xs={12}>
  <Grid
    container
    spacing={3}
    alignItems="stretch"
    sx={{ display: "flex", flexWrap: "nowrap" }}
  >
    <Grid item xs={12} md={9}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 1,
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Earnings Overview
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <EarningsChart />
        </Box>
      </Card>
    </Grid>

    {/* Right Widgets (Two stacked cards) */}
    <Grid
      item
      xs={12}
      md={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <QuickStatsChart />
      <RecentReviews />
    </Grid>
  </Grid>
</Grid>



        {/* My Courses */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            My Courses
          </Typography>
          <Grid container spacing={3}>
          
            {loading ? (
                  <Typography align="center" sx={{ mt: 3 }}>Loading courses...</Typography>
                ) : error ? (
                  <Typography color="error" align="center" sx={{ mt: 3 }}>
                    {error}
                  </Typography>
                ) : courses.length === 0 ? (
                  <Typography align="center" sx={{ mt: 3 }}>
                    No courses available at the moment.
                  </Typography>
                ) : (
                 <Grid
  container
  spacing={3}
  justifyContent="center"
  alignItems="stretch"
  sx={{ mt: 1 }}
>
  {courses.map((course) => (
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      key={course._id}
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <Box sx={{ width: "100%", maxWidth: 350 }}> {/* ✅ same max width for all */}
        <CourseCard
          course={{
            id: course._id,
            title: course.title,
            imageUrl: course.thumbnail || "https://via.placeholder.com/400x200",
            status: course.status || "Draft",
            price: course.price || 0,
            description: course.description,
          }}
        />
      </Box>
    </Grid>
  ))}
</Grid>

                )}

          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
