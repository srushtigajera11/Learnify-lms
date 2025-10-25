import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
  Box,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';

const CourseCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    category: 'Web Development',
    price: 0,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
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

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('price', formData.price);
    submitData.append('status', formData.status);
    
    if (thumbnailFile) {
      submitData.append('thumbnail', thumbnailFile);
    }

    try {
      const res = await axiosInstance.post('/courses/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(res.data.message || 'Course created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'draft',
        category: 'Web Development',
        price: 0,
      });
      setThumbnailFile(null);
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Error creating course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Create New Course
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
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
          name="status"
          select
          fullWidth
          label="Status"
          value={formData.status}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
        </TextField>

        <TextField
          type="file"
          fullWidth
          label="Course Thumbnail"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
          InputLabelProps={{ shrink: true }}
          margin="normal"
          inputProps={{ 
            accept: 'image/*',
            multiple: false 
          }}
          helperText="Recommended size: 400x300px. Max 5MB."
        />

        {thumbnailFile && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Selected file: {thumbnailFile.name}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            💡 <strong>Tips:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            • Draft: Save for later editing<br/>
            • Published: Make course available to students<br/>
            • You can add lessons after creating the course
          </Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Creating Course...' : 'Create Course'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CourseCreate;