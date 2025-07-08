// src/components/TutorSidebar.jsx
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PeopleIcon from "@mui/icons-material/People";
import PaidIcon from "@mui/icons-material/Paid";
import CreateIcon from "@mui/icons-material/Create";
import PersonIcon from "@mui/icons-material/Person";

const tutorMenu = [
  { text: "Dashboard", icon: <DashboardIcon />, route: "/tutor/dashboard" },
  { text: "Create Course", icon: <CreateIcon />, route: "/tutor/create-course" },
  { text: "My Courses", icon: <LibraryBooksIcon />, route: "/tutor/courses" },
  { text: "Enrolled Students", icon: <PeopleIcon />, route: "/tutor/students" },
  { text: "Earnings", icon: <PaidIcon />, route: "/tutor/earnings" },
  { text: "Profile", icon: <PersonIcon />, route: "/tutor/profile" },
];

const TutorSidebar = ({ onSelect, selectedRoute }) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 220,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 220,
          boxSizing: "border-box",
          bgcolor: "#fff",
          borderRight: "1px solid #e0e0e0",
          marginTop: "64px",
          height: "calc(100% - 64px)",
        },
      }}
    >
      <List>
        {tutorMenu.map((item, index) => {
          const isSelected = item.route === selectedRoute;
          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => onSelect(item.route)}
                sx={{
                  color: isSelected ? "#4c1d95" : "#4b5563",
                  bgcolor: isSelected ? "#e0e7ff" : "transparent",
                  "&:hover": {
                    bgcolor: "#f3e8ff",
                    color: "#4c1d95",
                  },
                  px: 2,
                  py: 1.5,
                  borderRadius: "6px",
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? "#4c1d95" : "#9ca3af",
                    minWidth: 36,
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
    </Drawer>
  );
};

export default TutorSidebar;
