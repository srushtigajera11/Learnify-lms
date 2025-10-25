// src/layouts/TutorDashboardLayout.jsx
import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../Components/Header";
import WelcomeBanner from "../Components/tutor_Welcome";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";

const TutorDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState(location.pathname);

  const handleSelect = (route) => {
    setSelectedRoute(route);
    navigate(route);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar (fixed) */}
      
     
      <Sidebar onSelect={handleSelect} selectedRoute={selectedRoute} />
  

      {/* Main section */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
  <WelcomeBanner user={"tutor"} />
  <Header />
  <Box component="main" sx={{ flex: 1, p: 4, bgcolor: "#f9fafb", minWidth: 0 }}>
    <Outlet />
  </Box>
  <Footer />
</Box>

    </Box>
  );
};

export default TutorDashboardLayout;
