import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Rating, Button } from '@mui/material';

const RecentReviews = () => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Recent Reviews
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar alt="Student" src="https://i.pravatar.cc/48?u=student1" />
          <Box sx={{ flexGrow: 1 }}>
            <Rating value={4.5} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              He taught well and made topics to understand!
            </Typography>
          </Box>
          <Button variant="contained" size="small">Reply</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentReviews;
