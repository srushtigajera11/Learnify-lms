import { Box, TextField, Button, Stack, Card, CardContent, Typography, Avatar } from "@mui/material";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Lock, VpnKey, Security } from "@mui/icons-material";

const UpdatePasswordForm = () => {
  const [formData, setFormData] = useState({
    current: "",
    newPassword: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirm) {
      alert("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put("/users/change-password", {
        currentPassword: formData.current,
        newPassword: formData.newPassword,
      });
      alert("Password updated successfully!");
      setFormData({ current: "", newPassword: "", confirm: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
              <Security fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Secure your account with a new password
              </Typography>
            </Box>
          </Box>

          <TextField
            type="password"
            label="Current Password"
            value={formData.current}
            onChange={handleChange('current')}
            required
            fullWidth
            variant="outlined"
            size="medium"
            InputProps={{
              startAdornment: <Lock color="action" sx={{ mr: 1 }} />
            }}
          />
          
          <TextField
            type="password"
            label="New Password"
            value={formData.newPassword}
            onChange={handleChange('newPassword')}
            required
            fullWidth
            variant="outlined"
            size="medium"
            helperText="Must be at least 6 characters long"
            InputProps={{
              startAdornment: <VpnKey color="action" sx={{ mr: 1 }} />
            }}
          />
          
          <TextField
            type="password"
            label="Confirm New Password"
            value={formData.confirm}
            onChange={handleChange('confirm')}
            required
            fullWidth
            variant="outlined"
            size="medium"
            error={formData.newPassword !== formData.confirm && formData.confirm !== ""}
            helperText={formData.newPassword !== formData.confirm && formData.confirm !== "" ? "Passwords don't match" : ""}
            InputProps={{
              startAdornment: <VpnKey color="action" sx={{ mr: 1 }} />
            }}
          />

          <Button 
            variant="contained" 
            type="submit" 
            disabled={loading}
            onClick={handleChangePassword}
            startIcon={<Security />}
            color="warning"
            sx={{ 
              alignSelf: 'flex-start',
              px: 3,
              py: 1,
              mt: 1
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UpdatePasswordForm;