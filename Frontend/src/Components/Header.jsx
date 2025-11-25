import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  InputBase,
  Badge,
  Typography,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../context/AuthContext"; // Import your auth context
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

const Search = styled("div")(() => ({
  position: "relative",
  borderRadius: 8,
  backgroundColor: "#f3f4f6", // Light gray for search box
  marginLeft: 0,
  flex: 1,
  maxWidth: 328,
}));

const SearchIconWrapper = styled("div")(() => ({
  padding: "0 12px",
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b7280", // Gray for icon
}));

const StyledInputBase = styled(InputBase)(() => ({
  color: "#1f2937", // Dark gray input text
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "10px 10px 10px 0",
    paddingLeft: `calc(1em + 32px)`,
    "&::placeholder": {
      color: "#9ca3af", // Lighter placeholder
      opacity: 1,
    },
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth(); // Get user and logout from auth context
  const navigate = useNavigate();

  // Get initials from user's name
  const getInitials = (name) => {
    if (!name) return "TU";
    const parts = name.trim().split(" ");
    return parts.length > 1 
      ? parts[0][0] + parts[parts.length - 1][0] 
      : parts[0][0];
  };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      handleMenuClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/tutor/profile");
    handleMenuClose();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ 
        bgcolor: "#ffffff", 
        color: "black", 
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1.5, px: 3 }}>
        {/* Left: Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Search courses, students..." />
        </Search>

        {/* Right: Notification + Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notification Bell */}
          <IconButton sx={{ color: "#4b5563" }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Avatar with Initials */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              "&:hover": { opacity: 0.8 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#6366f1",
                color: "white",
                width: 40,
                height: 40,
                fontSize: "14px",
                fontWeight: "bold",
                border: "2px solid #e5e7eb"
              }}
            >
              {user ? getInitials(user.name) : "TU"}
            </Avatar>
          </IconButton>

          {/* Dropdown Menu - Only Logout */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                borderRadius: 2,
                minWidth: 140,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                  fontSize: "0.9rem",
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    fontSize: '12px',
                    bgcolor: '#6366f1' 
                  }}
                >
                  {user ? getInitials(user.name) : "TU"}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {user?.name || "Tutor"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || "tutor@email.com"}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                color: "#dc2626",
                "&:hover": { 
                  backgroundColor: "#fef2f2",
                  color: "#dc2626"
                }
              }}
            >
              <LogoutIcon sx={{ fontSize: 18, mr: 1.5 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;