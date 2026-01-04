import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

import { useState } from "react";

const AdminNavbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: "white", color: "#111" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography fontWeight="bold" sx={{ color: "#6366f1" }}>
          Learnify • Admin
        </Typography>

        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            bgcolor: "#6366f1",
            color: "white",
            width: 40,
            height: 40,
          }}
        >
          A
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem>Dashboard</MenuItem>
          <MenuItem>Users</MenuItem>
          <MenuItem>Courses</MenuItem>
          <MenuItem>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
