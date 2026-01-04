import React from "react";
import { Grid, Card, Box, Typography, Avatar, Chip } from "@mui/material";

const UserList = ({ users }) => {
  return (
    <>
      <Typography variant="h5" mb={2}>
        👥 All Users
      </Typography>
      <Grid container spacing={3}>
        {users.map((user) => (
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
              <Box>
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
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default UserList;
