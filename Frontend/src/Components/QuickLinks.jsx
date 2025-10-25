import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Description, People, Settings, Help } from '@mui/icons-material';

const links = [
  { icon: <Description />, text: 'Create Payout Report' },
  { icon: <People />, text: 'View Students' },
  { icon: <Settings />, text: 'Settings' },
  { icon: <Help />, text: 'Support' },
];

const QuickLinks = () => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Quick Links
        </Typography>
        <List>
          {links.map((link, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton>
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default QuickLinks;
