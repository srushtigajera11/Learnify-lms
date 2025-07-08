// src/pages/tutor/Dashboard.jsx
import DashboardCard from "../../Layout/TutorDashboardCard";
import { Grid } from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PendingIcon from "@mui/icons-material/Pending";
import EarningsChart from "../../Components/EarningCharts";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";


const Dashboard = () => {
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
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "20px" }}>
        Welcome Back, Tutor 👋
      </h2>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<LibraryBooksIcon color="primary" />}
            color="#e3f2fd"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Enrollments"
            value={stats.totalEnrollments}
            icon={<GroupIcon color="success" />}
            color="#e8f5e9"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Monthly Earnings"
             value={`₹${(stats.monthlyEarnings || 0).toLocaleString()}`}

            icon={<AttachMoneyIcon color="warning" />}
            color="#fff3e0"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<PendingIcon color="error" />}
            color="#ffebee"
          />
        </Grid>
      </Grid>
       <EarningsChart />
    </div>
  );
};

export default Dashboard;
