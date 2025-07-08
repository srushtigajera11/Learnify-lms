// src/components/StudentSidebar.jsx
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const studentMenu = [
  { text: "Dashboard", icon: <DashboardIcon />, route: "/student/dashboard" },
  { text: "Enrolled Courses", icon: <SchoolIcon />, route: "/student/courses" },
  { text: "WishList", icon: <FavoriteIcon />, route: "/student/wishlist" },
  { text: "History", icon: <HistoryIcon />, route: "/student/purchaseHistory" },
  { text: "Profile", icon: <PersonIcon />, route: "/student/profile" },
];

const StudentSidebar = ({ onSelect, selectedRoute }) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          bgcolor: "#1c1d1f",  // Dark sidebar
          color: "#fff",
          borderRight: "none",
          marginTop: "64px",
          height: "calc(100% - 64px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      <Box>
        <List>
          {studentMenu.map((item, index) => {
            const isSelected = item.route === selectedRoute;
            return (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => onSelect(item.route)}
                  sx={{
                    color: isSelected ? "#fff" : "#d1d5db",
                    bgcolor: isSelected ? "#343638" : "transparent",
                    "&:hover": {
                      bgcolor: "#2d2f31",
                    },
                    px: 2,
                    py: 1.5,
                    borderRadius: "8px",
                    mx: 1,
                    my: 0.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? "#fff" : "#9ca3af",
                      minWidth: 36,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 15,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Logout Button (Sticky at bottom like Udemy) */}
      <Box>
        <Divider sx={{ backgroundColor: "#374151" }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => onSelect("/logout")}
            sx={{
              color: "#d1d5db",
              "&:hover": {
                bgcolor: "#2d2f31",
              },
              px: 2,
              py: 1.5,
              borderRadius: "8px",
              mx: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: "#9ca3af", minWidth: 36 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default StudentSidebar;
