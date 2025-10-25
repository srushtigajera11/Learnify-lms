import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { People, CheckCircle, Help, TrendingUp, Star } from '@mui/icons-material';

const stats = [
  { icon: <People color="primary" />, value: '12', label: 'New Enrollments', trend: '+8%' },
  { icon: <CheckCircle color="success" />, value: '7', label: 'Course Completions', trend: '+3%' },
  { icon: <Help color="secondary" />, value: '23', label: 'New Questions', trend: '+15%' },
  { icon: <Star color="warning" />, value: '5', label: 'Positive Reviews', trend: '+10%' },
];

const QuickStatsChart = () => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          This Week's Activity
        </Typography>
        <List>
          {stats.map((stat, index) => (
            <ListItem key={index} disablePadding>
              <ListItemIcon>{stat.icon}</ListItemIcon>
              <ListItemText primary={stat.value} secondary={stat.label} />
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                <TrendingUp sx={{ mr: 0.5 }} />
                <Typography variant="body2">{stat.trend}</Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default QuickStatsChart;
