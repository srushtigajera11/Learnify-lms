import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Card,
  CardMedia,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { CloudUpload, Send } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CourseCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    category: 'Web Development',
    price: 0,
    objectives: '',
    requirements: '',
    level: 'beginner',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Add this

  // Category options
  const categories = [
    'Web Development',
    'App Development', 
    'MERN Stack',
    'React',
    'Communication',
    'Python',
    'UI/UX'
  ];

  const levels = ['beginner', 'intermediate', 'advanced'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e, action = 'draft') => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      setLoading(false);
      return;
    }

    // If submitting for review, ensure required fields
    if (action === 'submit') {
      if (!thumbnailFile) {
        setError('Thumbnail is required when submitting for review');
        setLoading(false);
        return;
      }
      if (!formData.category) {
        setError('Category is required when submitting for review');
        setLoading(false);
        return;
      }
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('price', formData.price);
    submitData.append('level', formData.level);
    
    // Add objectives and requirements as arrays
    if (formData.objectives) {
      const objectivesArray = formData.objectives.split('\n').filter(obj => obj.trim());
      objectivesArray.forEach(obj => submitData.append('objectives', obj.trim()));
    }
    
    if (formData.requirements) {
      const requirementsArray = formData.requirements.split('\n').filter(req => req.trim());
      requirementsArray.forEach(req => submitData.append('requirements', req.trim()));
    }
    
    if (thumbnailFile) {
      submitData.append('thumbnail', thumbnailFile);
    }

    try {
      const res = await axiosInstance.post('/courses/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const courseId = res.data.course._id;
      
      // If user wants to submit for review immediately
      if (action === 'submit') {
        try {
          await axiosInstance.put(`/courses/${courseId}/submit`);
          setMessage('Course created and submitted for admin approval!');
        } catch (submitError) {
          setMessage('Course created as draft. You can submit for review later.');
        }
      } else {
        setMessage('Course created as draft!');
      }
      
      // Navigate to courses list after 2 seconds
      setTimeout(() => {
        navigate('/tutor/courses');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Error creating course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', mt: 5, p: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Create New Course
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={(e) => handleSubmit(e, 'draft')}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              name="title"
              fullWidth
              label="Course Title"
              value={formData.title}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="e.g., Complete Web Development Bootcamp"
            />

            <TextField
              name="description"
              fullWidth
              label="Course Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="Describe what students will learn in this course..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="category"
                  select
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={handleChange}
                  margin="normal"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="level"
                  select
                  fullWidth
                  label="Difficulty Level"
                  value={formData.level}
                  onChange={handleChange}
                  margin="normal"
                >
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              name="price"
              type="number"
              fullWidth
              label="Price"
              value={formData.price}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              name="objectives"
              fullWidth
              label="Learning Objectives"
              multiline
              rows={3}
              value={formData.objectives}
              onChange={handleChange}
              margin="normal"
              placeholder="Enter one objective per line..."
              helperText="What will students learn? (One per line)"
            />

            <TextField
              name="requirements"
              fullWidth
              label="Requirements"
              multiline
              rows={3}
              value={formData.requirements}
              onChange={handleChange}
              margin="normal"
              placeholder="Enter one requirement per line..."
              helperText="What do students need to know beforehand? (One per line)"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              {thumbnailFile ? (
                <CardMedia
                  component="img"
                  image={URL.createObjectURL(thumbnailFile)}
                  alt="Thumbnail preview"
                  sx={{ height: 200, objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100',
                    color: 'grey.500',
                  }}
                >
                  <Typography>Thumbnail Preview</Typography>
                </Box>
              )}
            </Card>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Upload Thumbnail
              <input 
                type="file" 
                hidden 
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
              />
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Recommended: 400x300px, max 5MB
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            💡 <strong>Tips:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            • <strong>Draft</strong>: Save for later editing<br/>
            • <strong>Submit for Review</strong>: Send to admin for approval<br/>
            • Thumbnail is required when submitting for review<br/>
            • You can add lessons after creating the course
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading || !thumbnailFile}
            onClick={(e) => handleSubmit(e, 'submit')}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CourseCreate;