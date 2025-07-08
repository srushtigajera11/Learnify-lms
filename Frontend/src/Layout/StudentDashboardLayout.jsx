// src/layouts/StudentDashboardLayout.jsx
import React, { useState,useEffect } from "react";
import { Routes, Route, useNavigate , useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import SharedHeader from "../components/SharedHeader";
import StudentSidebar from "../Components/StudentSidebar";
import EnrolledCourses from "../pages/Student/EnrolledCourses";
import Dashboard from "../pages/Student/Dashboard";
import WishList from "../pages/Student/WishList";
import Reviews from "../pages/Student/Reviews";
import PurchaseHistory from "../pages/Student/PurchaseHistory";
import Profile from "../pages/Student/Profile";
import CourseDetail from "../pages/Student/CourseDetail";
import axiosInstance from "../utils/axiosInstance";



const StudentDashboardLayout = () => {
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
        <StudentSidebar onSelect={(route) => navigate(route)}
          selectedRoute={location.pathname} />
        <Box component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f8f9fc",
            p: 3,
            minHeight: "calc(100vh - 64px)",
          }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<EnrolledCourses />} />
            <Route path="wishlist" element={<WishList />} />
            <Route path="review" element={<Reviews />} />
            <Route path="purchaseHistory" element={<PurchaseHistory />} />
            <Route path="profile" element={<Profile user={user} />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
            {/* Add more routes as needed */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
};

export default StudentDashboardLayout;
