import {
  Box, Card, CardContent, Typography, Avatar,
  Grid, Divider, Tabs, Tab, Container, Paper,
  Chip, Button, alpha, Stack
} from "@mui/material";
import { useState } from "react";
import EditProfileForm from "../../Components/EditProfileForm";
import UpdatePasswordForm from "../../Components/UpdatePassword";
import {
  Security,
  Person,
  CalendarToday,
  Email,
  Badge,
  LinkedIn,
  Twitter,
  Language,
  School,
  Work,
  LocationOn
} from "@mui/icons-material";

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
};

const Profile = ({ user }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!user) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Typography variant="h6">Loading...</Typography>
    </Box>
  );

  // Mock data for demonstration
  const profileData = {
    bio: "Senior Full Stack Developer with 5+ years of experience in React, Node.js, and MongoDB. Passionate about teaching and creating impactful learning experiences.",
    location: "San Francisco, CA",
    website: "https://john-doe-portfolio.com",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    expertise: ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript", "Express", "HTML/CSS", "REST APIs"],
    students: 1250,
    courses: 8,
    rating: 4.8,
    reviews: 156
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 0 }}>
      {/* Compact Header Banner */}
      <Box
        sx={{
          height: 140,
          background: `linear(135deg, #6a11cb 0%, #2575fc 100%)`,
          position: 'relative',
          mb: 7
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
          <Box sx={{ 
            position: 'absolute', 
            bottom: -40,
            left: 24, 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: 3 
          }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                fontSize: 28,
                bgcolor: 'white',
                color: 'primary.main',
                border: '4px solid white',
                boxShadow: 3
              }}
            >
              {getInitials(user.name)}
            </Avatar>
            
            <Box sx={{ mb: 0.5, color: 'white' }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {user.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label="INSTRUCTOR"
                  color="primary"
                  variant="filled"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 4, mt: -1 }}>
        <Grid container spacing={2}>
          {/* Left Sidebar - Fixed Width Cards */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5}>
              {/* Instructor Stats - Fixed Width */}
              <Paper 
                elevation={1} 
                sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  mt: -1,
                  width: '100%', // Fixed width
                  minHeight: 160 // Fixed height
                }}
              >
                <CardContent sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ fontSize: '1rem' }}>
                    Instructor Stats
                  </Typography>
                  <Box sx={{ space: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Students</Typography>
                      <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">{profileData.students.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Courses</Typography>
                      <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">{profileData.courses}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">{profileData.rating}</Typography>
                        <Box sx={{ color: '#f4c150', fontSize: '14px' }}>★</Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Reviews</Typography>
                      <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">{profileData.reviews}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>

              {/* Contact & Links - Fixed Width */}
              <Paper 
                elevation={1} 
                sx={{ 
                  borderRadius: 2, 
                  p: 2,
                  width: '100%', // Fixed width
                  minHeight: 140 // Fixed height
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ fontSize: '1rem' }}>
                  Contact & Links
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color="action" fontSize="small" />
                    <Typography variant="body2" fontSize="0.8rem" noWrap>{user.email}</Typography>
                  </Box>
                  {profileData.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Language color="action" fontSize="small" />
                      <Typography variant="body2" fontSize="0.8rem" noWrap sx={{ textDecoration: 'none', color: 'inherit' }}>
                        Portfolio Website
                      </Typography>
                    </Box>
                  )}
                  {profileData.linkedin && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkedIn color="action" fontSize="small" />
                      <Typography variant="body2" fontSize="0.8rem" noWrap>LinkedIn Profile</Typography>
                    </Box>
                  )}
                  {profileData.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="action" fontSize="small" />
                      <Typography variant="body2" fontSize="0.8rem" noWrap>{profileData.location}</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>

              {/* Expertise - Fixed Width with Scroll */}
              <Paper 
                elevation={1} 
                sx={{ 
                  borderRadius: 2, 
                  p: 2,
                  width: '100%', // Fixed width
                  minHeight: 120, // Fixed height
                  maxHeight: 140 // Maximum height
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ fontSize: '1rem' }}>
                  Areas of Expertise
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5,
                    maxHeight: 80, // Limit height
                    overflow: 'auto', // Add scroll if too many tags
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#ccc',
                      borderRadius: '2px',
                    }
                  }}
                >
                  {profileData.expertise.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontSize: '0.65rem',
                        height: '22px',
                        flexShrink: 0 // Prevent chips from shrinking
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Stack>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {/* Bio Section */}
              <Paper elevation={1} sx={{ borderRadius: 2, p: 2.5, mt: -1 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary" sx={{ fontSize: '1.25rem' }}>
                  About Me
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {profileData.bio}
                </Typography>
              </Paper>

              {/* Settings Tabs */}
              <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: alpha('#6a11cb', 0.02)
                }}>
                  <Tabs
                    value={tabIndex}
                    onChange={(e, val) => setTabIndex(val)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        py: 1.5,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        minHeight: '44px'
                      }
                    }}
                  >
                    <Tab 
                      icon={<Person sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                      label="Edit Profile" 
                    />
                    <Tab 
                      icon={<Security sx={{ fontSize: 16 }} />} 
                      iconPosition="start"
                      label="Security & Password" 
                    />
                  </Tabs>
                </Box>

                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ minHeight: 320 }}>
                    {tabIndex === 0 && (
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ mb: 1.5, fontSize: '1rem' }}>
                          Personal Information
                        </Typography>
                        <EditProfileForm user={user} />
                      </Box>
                    )}
                    
                    {tabIndex === 1 && (
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ mb: 1.5, fontSize: '1rem' }}>
                          Security Settings
                        </Typography>
                        <UpdatePasswordForm />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;