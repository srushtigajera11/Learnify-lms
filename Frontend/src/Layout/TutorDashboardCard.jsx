import { Card, CardContent, Typography, Box } from "@mui/material";

const TutorDashboardCard = ({ title, value, icon, color }) => {
  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        bgcolor: "white",
      }}
    >
      {/* Icon Circle */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: color || "#e0e7ff", // light tint
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2,
        }}
      >
        {icon}
      </Box>

      {/* Text Content */}
      <CardContent sx={{ p: 0 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 500 }}
        >
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TutorDashboardCard;
