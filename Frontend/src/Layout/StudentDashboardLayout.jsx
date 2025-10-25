import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import StudentNavbar from "../Components/StudentNavbar";
import Footer from "../Components/Footer";
import WelcomeBanner from "../Components/WelcomeBanner";
import axiosInstance from "../utils/axiosInstance";

const StudentDashboardLayout = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axiosInstance.get("/users/profile");
        if (response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUser(null);
      }
    };
    getProfile();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero Banner (Welcome + Stats) */}
      <WelcomeBanner user={user} />

      {/* Navbar sits below banner */}
      <StudentNavbar user={user} />

      <Box component="main">
    <Outlet />
  </Box>

  <Footer />


    </Box>
  );
};

export default StudentDashboardLayout;
