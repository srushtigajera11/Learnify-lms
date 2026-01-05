import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: "240px",          // 👈 sidebar width
          p: 3,
          bgcolor: "#f9fafb",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
