// src/components/DashboardCard.jsx
import { Card, CardContent, Typography } from "@mui/material";
import EarningsCharts from "../Components/EarningCharts";

const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <>
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        backgroundColor: color || "#f5f5f5",
        boxShadow: 3,
        borderRadius: 3,
      }}
    >
      <div style={{ fontSize: "2rem", marginRight: 16 }}>{icon}</div>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
   
    </>
  );
};

export default DashboardCard;
