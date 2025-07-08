import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import axiosInstance from "../utils/axiosInstance"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const SharedHeader = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try{
      await axiosInstance.post("/users/logout");
      navigate("/login"); // Redirect to login page after logout
      
    }catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    }
  
  };

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        bgcolor: "#0d22a0b0", // primary purple
        color: "#fff",
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo + LMS Name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, letterSpacing: 0.5 }}
          >
            Learnify 
          </Typography>
        </Box>

        {/* Right section: notification + avatar + logout */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton sx={{ color: "#fff" }}>
            <NotificationsIcon />
          </IconButton>
          <Avatar alt="Tutor" src="/profile.jpg" sx={{ bgcolor: "#ede9fe" }} />
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              borderColor: "#fff",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#fff",
                color: "#673ab7",
              },
              border: "1px solid #fff",
              textTransform: "none",
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SharedHeader;
