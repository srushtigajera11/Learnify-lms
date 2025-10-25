// src/components/TutorSidebar.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  LibraryBooks as LibraryBooksIcon,
  People as PeopleIcon,
  Paid as PaidIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const tutorMenu = [
  { text: "Dashboard", icon: <DashboardIcon />, route: "/tutor/dashboard" },
  { text: "Create Course", icon: <CreateIcon />, route: "/tutor/create-course" },
  { text: "My Courses", icon: <LibraryBooksIcon />, route: "/tutor/courses" },
  { text: "Enrolled Students", icon: <PeopleIcon />, route: "/tutor/students" },
  { text: "Earnings", icon: <PaidIcon />, route: "/tutor/earnings" },
  { text: "Profile", icon: <PersonIcon />, route: "/tutor/profile" },
];

const Sidebar = ({ onSelect, selectedRoute }) => {
  return (
    <Box
      sx={{
        width: 240, // increased width
        bgcolor: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky", // sidebar will stick when scrolling
        top: 0,
        borderRight: "1px solid #1e293b",
        py: 2,
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 4, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#ffffff" }}>
          Learnify
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2 }}>
        {tutorMenu.map((item, index) => {
          const isSelected = item.route === selectedRoute;
          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => onSelect(item.route)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: isSelected ? "rgba(24,85,218,0.77)" : "transparent",
                  color: isSelected ? "#6366f1" : "#f8fbffff",
                  "&:hover": {
                    bgcolor: isSelected
                      ? "rgba(99,102,241,0.25)"
                      : "rgba(24,85,218,0.77)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? "#6366f1" : "#9ca3afff",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

        {/* Footer
        <Box sx={{ mt: "auto", px: 4, py: 2 }}>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Learnify Tutor Panel
          </Typography>
        </Box> */}
    </Box>
  );
};

Sidebar.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selectedRoute: PropTypes.string.isRequired,
};

export default Sidebar;
