// src/layouts/TutorDashboardLayout.jsx
import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
import { useAuth } from "../context/AuthContext";

const TutorDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState(location.pathname);
  const { user } = useAuth();

  const handleSelect = (route) => {
    setSelectedRoute(route);
    navigate(route);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar onSelect={handleSelect} selectedRoute={selectedRoute} />

      {/* Main section - FIXED SPACING */}
      <Box sx={{ 
        flexGrow: 1, 
        minWidth: 0, 
        display: "flex", 
        flexDirection: "column",
        width: 'calc(100vw - 240px)' // Adjust based on sidebar width
      }}>
        {/* <WelcomeBanner user={user} /> */}
        <Header />
        
        {/* Main content area - REDUCED PADDING */}
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            p: 0, // Reduced from p:4 to p:2 (16px instead of 32px)
            bgcolor: "#f9fafb", 
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            overflow: 'auto' // Allow scrolling if content is too tall
          }}
        >
          <Outlet context={user} />
        </Box>
        
        <Footer />
      </Box>
    </Box>
  );
};

export default TutorDashboardLayout;