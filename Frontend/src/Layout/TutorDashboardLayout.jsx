// src/layouts/TutorDashboardLayout.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import SharedHeader from "../components/SharedHeader";
import TutorSidebar from "../Components/TutorSidebar";
import axiosInstance from "../utils/axiosInstance";

const TutorDashboardLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    <>
      <SharedHeader />
      <Box sx={{ display: "flex" }}>
        <TutorSidebar
          onSelect={(route) => navigate(route)}
          selectedRoute={location.pathname}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f8f9fc",
            p: 3,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet context={user} /> {/* ⬅️ This is where nested routes will render */}
        </Box>
      </Box>
    </>
  );
};

export default TutorDashboardLayout;
