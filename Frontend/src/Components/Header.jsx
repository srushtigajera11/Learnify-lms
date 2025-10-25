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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";

const Search = styled("div")(() => ({
  position: "relative",
  borderRadius: 8,
  backgroundColor: "#1e293b", // dark gray for search box
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
  color: "#9ca3af", // light gray for icon
}));

const StyledInputBase = styled(InputBase)(() => ({
  color: "white", // white input text
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "10px 10px 10px 0",
    paddingLeft: `calc(1em + 32px)`,
    "&::placeholder": {
      color: "#9ca3af", // lighter placeholder
      opacity: 1,
    },
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const initials = "SJ"; // Replace with dynamic initials

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{ bgcolor: "#ffff", color: "white", borderBottom: "1px solid #1e293b" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
        {/* Left: Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Search courses..." />
        </Search>

        {/* Right: Notification + Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notification Bell */}
          <IconButton sx={{ color: "black" }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Initials */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              bgcolor: "#6366f1",
              color: "white",
              width: 40,
              height: 40,
              borderRadius: "50%",
              "&:hover": { bgcolor: "#5149d6" },
            }}
          >
            <Typography fontWeight="bold">{initials}</Typography>
          </IconButton>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>📜 My Learning</MenuItem>
            <MenuItem onClick={handleMenuClose}>❤️ Wishlist</MenuItem>
            <MenuItem onClick={handleMenuClose}>📖 History</MenuItem>
            <MenuItem onClick={handleMenuClose}>👤 Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>🚪 Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
