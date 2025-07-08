import { Box, TextField, Button, Stack } from "@mui/material";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const UpdatePasswordForm = () => {
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);
      await axiosInstance.put("/users/change-password", {
        currentPassword: current,
        newPassword,
      });
      alert("Password updated!");
      setCurrent(""); setNewPassword(""); setConfirm("");
    } catch (err) {
      console.error(err);
      alert("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleChangePassword}>
      <Stack spacing={2}>
        <TextField
          type="password"
          label="Current Password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
        <TextField
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <TextField
          type="password"
          label="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </Stack>
    </Box>
  );
};

export default UpdatePasswordForm;
