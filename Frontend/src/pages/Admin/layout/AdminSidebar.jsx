import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";

const AdminSidebar = ({ selected, onSelect }) => {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { key: "courses", label: "Courses", icon: <MenuBookIcon /> },
    { key: "users", label: "Users", icon: <PeopleIcon /> },
    { key: "payments", label: "Payments", icon: <PaymentsIcon /> },
    { key: "enrollments", label: "Enrollments", icon: <SchoolIcon /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // or "token"
    window.location.href = "/login";
  };

  return (
    <Box
      sx={{
        width: 260,
        height: "100vh",
        bgcolor: "#0f172a",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#6366f1" }}>
          Learnify Admin
        </Typography>
        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
          Control Panel
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "#1e293b" }} />

      {/* Menu */}
      <List sx={{ px: 1, mt: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.key}
            onClick={() => onSelect(item.key)}
            selected={selected === item.key}
            sx={{
              mb: 0.5,
              borderRadius: 1,
              color: "#e5e7eb",
              "&.Mui-selected": {
                bgcolor: "#1e293b",
                borderLeft: "4px solid #6366f1",
              },
              "&:hover": { bgcolor: "#1e293b" },
            }}
          >
            <ListItemIcon
              sx={{
                color: selected === item.key ? "#6366f1" : "#cbd5f5",
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: selected === item.key ? 600 : 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ mt: "auto", px: 1, pb: 2 }}>
        <Divider sx={{ borderColor: "#1e293b", mb: 1 }} />

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            color: "#f87171",
            "&:hover": {
              bgcolor: "rgba(248,113,113,0.12)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#f87171", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
