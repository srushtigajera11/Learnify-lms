import { Box, TextField, Button, Stack } from "@mui/material";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const EditProfileForm = ({ user }) => {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.put("/users/profile", { name, email });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Save Changes"}
        </Button>
      </Stack>
    </Box>
  );
};

export default EditProfileForm;
