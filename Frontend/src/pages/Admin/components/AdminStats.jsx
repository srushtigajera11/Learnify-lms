import { Grid } from "@mui/material";
import StatCard from "../StatsCard";
import { People, School, Payments, Person } from "@mui/icons-material";

const AdminStats = ({ stats }) => (
  <Grid container spacing={3} mb={4}>
    <Grid item xs={12} md={3}>
      <StatCard title="Users" value={stats.totalUsers} icon={<People />} />
    </Grid>
    <Grid item xs={12} md={3}>
      <StatCard title="Courses" value={stats.totalCourses} icon={<School />} />
    </Grid>
    <Grid item xs={12} md={3}>
      <StatCard title="Enrollments" value={stats.totalEnrollments} icon={<Person />} />
    </Grid>
    <Grid item xs={12} md={3}>
      <StatCard
        title="Revenue"
        value={`₹${stats.totalRevenue}`}
        icon={<Payments />}
        color="#20c55e"
      />
    </Grid>
  </Grid>
);

export default AdminStats;
