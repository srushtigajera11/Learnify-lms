import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance'; // adjust path if needed
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
  Box,
  Alert,
  Paper,
} from '@mui/material';
import { ThumbDown } from '@mui/icons-material';

const CourseCreate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [category, setCategory] = useState('Web Development');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('status', status);
    formData.append('thumbnail', thumbnailFile); 

    try {
    
      const res = await axiosInstance.post('/courses/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(res.data.message);
      setError('');
      setTitle('');
      setDescription('');
      setStatus('draft');
      setCategory('Web Development');
      setPrice(0);
      setThumbnailFile(null);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Error creating course');
      setMessage('');
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New Course
      </Typography>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          margin="normal"
        />

        
        <TextField
          select
          fullWidth
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          margin="normal"
        >
          <MenuItem value="Web devlopment">Web Dev</MenuItem>
          <MenuItem value="App devlopment">JAVA</MenuItem>
           <MenuItem value="MERN">MERN stack</MenuItem>
            <MenuItem value="React">React</MenuItem>
             <MenuItem value="Communication">Communication</MenuItem>
              <MenuItem value="Python">Python</MenuItem>
               <MenuItem value="UI-UX">UI/UX</MenuItem>
        </TextField>
        <TextField
          type="number"
          fullWidth
          label="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          margin="normal"
          />
        <TextField
          select
          fullWidth
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          margin="normal"
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
        </TextField>
        <TextField
  type="file"
  name="thumbnail"
  fullWidth
  label="Thumbnail"
 onChange={(e) => setThumbnailFile(e.target.files[0])}
  InputLabelProps={{ shrink: true }}
  margin="normal"
  inputProps={{ accept: 'image/*' }}
/>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Note: Thumbnail is optional but recommended for better visibility.
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            *Ensure all fields are filled correctly before submitting.
          </Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Create Course
        </Button>
      </Box>
    </Paper>
  );
};

export default CourseCreate;
