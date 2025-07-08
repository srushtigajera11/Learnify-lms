import {
  Box, Card, CardContent, Typography, Avatar,
  Grid, Divider, Tabs, Tab
} from "@mui/material";
import { useState } from "react";
import EditProfileForm from "../../Components/EditProfileForm";
import UpdatePasswordForm from "../../Components/UpdatePassword";

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
};

const Profile = ({ user }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* LEFT - Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center", p: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mx: "auto", fontSize: 32, bgcolor: "primary.main" }}>
              {getInitials(user.name)}
            </Avatar>
            <Typography variant="h6" mt={2}>{user.name}</Typography>
            <Typography color="textSecondary">{user.email}</Typography>
            <Typography variant="caption" color="primary">{user.role}</Typography>

            <Divider sx={{ my: 2 }} />
            <Typography variant="body2">
              Joined on: {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Card>
        </Grid>

        {/* RIGHT - Tab View */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs
              value={tabIndex}
              onChange={(e, val) => setTabIndex(val)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Edit Profile" />
              <Tab label="Change Password" />
            </Tabs>
            <Divider />

            <CardContent>
              {tabIndex === 0 && <EditProfileForm user={user} />}
              {tabIndex === 1 && <UpdatePasswordForm />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
