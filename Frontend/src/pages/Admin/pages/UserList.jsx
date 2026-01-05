import React, { useState, useEffect } from "react";
import { Grid, Card, Box, Typography, Avatar, Chip, Button } from "@mui/material";
import { blockUnblockUser } from "../services/adminApi";

const UserList = ({ users, refresh }) => {
  const [localUsers, setLocalUsers] = useState([]);

  // Sync with parent whenever `users` prop changes
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleBlockToggle = async (userId) => {
    // Optimistically update the local state
    const updatedUsers = localUsers.map((u) =>
      u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u
    );
    setLocalUsers(updatedUsers);

    try {
      const user = updatedUsers.find((u) => u._id === userId);
      await blockUnblockUser(userId, user.isBlocked);
     
    } catch (err) {
      
      // revert state on failure
      setLocalUsers(users);
    }
  };

  return (
    <>
      <Typography variant="h5" mb={2}>
        👥 All Users
      </Typography>
      <Grid container spacing={3}>
        {localUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user._id}>
            <Card
              sx={{
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                p: 2,
                gap: 2,
                boxShadow: 2,
              }}
            >
              <Avatar sx={{ bgcolor: "#6366f1" }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight="bold">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip
                  size="small"
                  label={user.isAdmin ? "ADMIN" : user.role?.toUpperCase() || "STUDENT"}
                  color={user.isAdmin ? "error" : "info"}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>
              {!user.isAdmin && (
                <Button
                  size="small"
                  color={user.isBlocked ? "success" : "error"}
                  variant="contained"
                  onClick={() => handleBlockToggle(user._id)}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </Button>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default UserList;
