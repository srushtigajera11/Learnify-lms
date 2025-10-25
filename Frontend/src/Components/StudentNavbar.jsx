import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  InputBase,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom"; // 👈 import this

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 8,
  backgroundColor: "#1f2937",
  "&:hover": { backgroundColor: "#374151" },
  marginLeft: theme.spacing(2),
  width: "100%",
  maxWidth: 400,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "white",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: 14,
  },
}));

const StudentNavbar = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate(); // 👈 hook for navigation

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = async () => {
    try {
      // 1. Optional: Call backend logout (only if your API supports it)
      await axiosInstance.post("/users/logout").catch(() => {});

      // 2. Remove token from storage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // 3. Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#111827", py: 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ cursor: "pointer", color: "white" }}
          onClick={() => navigate("/student/dashboard")} // 👈 logo redirects too
        >
          Learnify
        </Typography>

        {/* Search Bar */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon sx={{ color: "#9ca3af" }} />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Search courses..." />
        </Search>

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* My Learning Button */}
          <Button
            sx={{ color: "white", textTransform: "none" }}
            onClick={() => navigate("/student/mylearning")} // 👈 redirect
          >
            My Learning
          </Button>

          <IconButton sx={{ color: "white" }}>
            <FavoriteBorderIcon  onClick={() => navigate("/student/wishlist")}/>
          </IconButton>

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

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/student/mylearning"); // 👈 same redirect
              }}
            >
              📜 My Learning
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/student/wishlist"); // 👈 same redirect
              }}
            >
              ❤️ Wishlist
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/student/purchaseHistory");
              }}
            >
              📖 History
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/student/profile");
              }}
            >
              👤 Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>🚪 Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default StudentNavbar;
