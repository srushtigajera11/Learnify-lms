// ================= ADMIN DASHBOARD PAGE =================
import { Grid, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PaymentsIcon from "@mui/icons-material/Payments";


export const AdminDashboard = () => {
return (
<div>
<Typography variant="h5" fontWeight="bold">
Dashboard
</Typography>
<Typography variant="body2" color="text.secondary" mb={3}>
Platform overview
</Typography>


<Grid container spacing={3}>
<Grid item xs={12} md={4}>
<StatCard title="Total Users" value="1,240" icon={<PeopleIcon />} />
</Grid>
<Grid item xs={12} md={4}>
<StatCard title="Courses" value="32" icon={<MenuBookIcon />} />
</Grid>
<Grid item xs={12} md={4}>
<StatCard title="Revenue" value="₹1.2L" icon={<PaymentsIcon />} />
</Grid>
</Grid>
</div>
);
};