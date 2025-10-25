import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent,
  Tabs, Tab, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { ArrowBack, ExpandMore, Edit, Schedule, WorkspacePremium, AllInclusive } from '@mui/icons-material';

const myCourses = [
    {
        id: 1,
        title: 'Communication : lessons for Better inretaction',
        description: 'Master the art of effective communication for personal and professional success. This course covers verbal, non-verbal, and written communication skills for interviews, presentations, and everyday interactions.',
        category: 'Communication',
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 2399.00,
        status: 'Published'
    },
    {
        id: 2,
        title: 'Into to Python',
        description: 'A comprehensive introduction to Python for beginners. Learn the fundamentals of programming, data structures, and algorithms with hands-on projects and exercises.',
        category: 'Python',
        imageUrl: 'https://images.unsplash.com/photo-1599819095817-a068a0a104f6?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 1230.00,
        status: 'Published'
    },
    {
        id: 3,
        title: 'Advanced UI/UX Design Principles',
        description: 'Go beyond the basics and explore advanced UI/UX design principles. This course focuses on creating intuitive, user-centered designs for complex applications and systems.',
        category: 'Design',
        imageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 3500.00,
        status: 'Draft'
    }
];

const CourseView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const course = myCourses.find(c => c.id.toString() === courseId);

  if (!course) return <Typography>Course not found.</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/my-courses')} sx={{ mb: 2 }}>
        Back to My Courses
      </Button>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>{course.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>{course.description}</Typography>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Curriculum" />
            <Tab label="Q&A" />
          </Tabs>
          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Section 1: Introduction</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Lesson 1: Welcome to the course!</Typography>
                </AccordionDetails>
              </Accordion>
               <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Section 2: Core Concepts</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Lesson 1: Understanding the basics.</Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
           {activeTab === 1 && (
             <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography>Q&A section is under construction.</Typography>
             </Box>
           )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia component="img" height="200" image={course.imageUrl} alt={course.title} />
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>₹{course.price}</Typography>
              <Button variant="contained" fullWidth startIcon={<Edit />}>Edit Course</Button>
               <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>This course includes:</Typography>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Schedule sx={{ mr: 1 }} /> 12 hours on-demand video</Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><AllInclusive sx={{ mr: 1 }}/> Full lifetime access</Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><WorkspacePremium sx={{ mr: 1 }} /> Certificate of completion</Box>
               </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseView;
