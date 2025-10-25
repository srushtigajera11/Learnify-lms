// src/components/StudentNavbar.jsx

import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const SharedHeader = ({ user }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - 240px)`,
        ml: "240px",
        bgcolor: "#1c1d1f",
        boxShadow: "none",
        borderBottom: "1px solid #2d2f31",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* Logo / Title */}
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
          Dashboard
        </Typography>

        {/* Right-side: notifications and avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Notifications">
            <IconButton sx={{ color: "#9ca3af" }}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton sx={{ p: 0 }}>
              <Avatar
                alt={user?.name || "User"}
                src={user?.avatarUrl || ""}
                sx={{ width: 36, height: 36 }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SharedHeader;
