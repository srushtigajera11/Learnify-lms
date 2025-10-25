import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
} from '@mui/material';
import {
  Delete,
  Add,
  ArrowBack,
  VideoFile,
  Description,
  Link as LinkIcon,
  CloudUpload,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

const EditLesson = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    order: '',
    materials: []
  });
  const [newMaterial, setNewMaterial] = useState({ 
    type: 'document', 
    file: null, 
    url: '', 
    name: '',
    preview: null 
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/lessons/lesson/${lessonId}`);
        console.log("Full API response:", res.data); // Debug log
        
        if (res.data.success && res.data.lesson) {
          const lesson = res.data.lesson;
          console.log("Lesson materials:", lesson.materials); // Debug log
          
          setLessonData({
            title: lesson.title || '',
            description: lesson.description || '',
            order: lesson.order || '',
            materials: lesson.materials || [] // Ensure this is an array
          });
        } else {
          setError('Failed to load lesson data');
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setError('Failed to load lesson data');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLessonData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleMaterialTypeChange = (e) => {
    const type = e.target.value;
    setNewMaterial({ 
      type, 
      file: null, 
      url: '', 
      name: '',
      preview: null 
    });
  };

  const handleMaterialNameChange = (e) => {
    setNewMaterial(prev => ({ ...prev, name: e.target.value }));
  };

  const handleMaterialUrlChange = (e) => {
    setNewMaterial(prev => ({ ...prev, url: e.target.value }));
  };

  const handleMaterialFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File validation
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB');
      return;
    }

    let preview = null;
    if (file.type.startsWith('video/')) {
      preview = URL.createObjectURL(file);
    }

    setNewMaterial(prev => ({
      ...prev,
      file: file,
      name: file.name || prev.name,
      preview: preview
    }));
    setError('');
  };

  const addMaterial = () => {
    // Validation
    if (!newMaterial.name.trim()) {
      setError('Please provide a name for the material');
      return;
    }

    if (newMaterial.type === 'link') {
      if (!newMaterial.url.trim()) {
        setError('Please provide a URL for the link');
        return;
      }
      // Add link material
      setLessonData(prev => ({
        ...prev,
        materials: [...prev.materials, { 
          type: newMaterial.type, 
          url: newMaterial.url, 
          name: newMaterial.name 
        }]
      }));
    } else {
      if (!newMaterial.file) {
        setError(`Please select a file for ${newMaterial.type}`);
        return;
      }
      // Add file material (file will be handled in backend)
      setLessonData(prev => ({
        ...prev,
        materials: [...prev.materials, { 
          type: newMaterial.type, 
          file: newMaterial.file, 
          name: newMaterial.name,
          preview: newMaterial.preview 
        }]
      }));
    }

    // Reset form
    setNewMaterial({ 
      type: 'document', 
      file: null, 
      url: '', 
      name: '',
      preview: null 
    });
    setError('');
  };

  const removeMaterial = (index) => {
    setLessonData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };
  // ... (rest of your handlers remain the same)

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!lessonData.title.trim() || !lessonData.order) {
    setError('Title and order are required');
    return;
  }

  setUpdating(true);
  setError('');
  setSuccess('');

  try {
    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('order', lessonData.order);

    // Debug: Log what's being sent
    console.log("=== EDIT LESSON FRONTEND DEBUG ===");
    console.log("Existing materials:", lessonData.materials);
    console.log("Materials count:", lessonData.materials.length);

    // Append existing materials
    lessonData.materials.forEach((material, index) => {
      console.log(`Appending existing material ${index}:`, material);
      formData.append(`materials[${index}][type]`, material.type);
      formData.append(`materials[${index}][name]`, material.name);
      
      if (material.type === 'link') {
        formData.append(`materials[${index}][url]`, material.url);
      } else if (material.url) {
        formData.append(`materials[${index}][url]`, material.url);
      }
    });

    // Log FormData contents
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    await axiosInstance.put(`/lessons/lesson/${lessonId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    setSuccess('Lesson updated successfully!');
    
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  } catch (error) {
    console.error('Error updating lesson:', error);
    setError(error.response?.data?.message || 'Failed to update lesson');
  } finally {
    setUpdating(false);
  }
};
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'video': return <VideoFile color="error" />;
      case 'document': return <Description color="primary" />;
      case 'link': return <LinkIcon color="success" />;
      default: return <Description color="action" />;
    }
  };

  const getFileAcceptType = (type) => {
    switch (type) {
      case 'video': return 'video/*';
      case 'document': return '.pdf,.doc,.docx,.txt';
      default: return '*';
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', mt: 3, p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Edit Lesson
        </Typography>
      </Box>

      {/* Debug Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Materials count: {lessonData.materials.length}
      </Alert>

      {/* Messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Lesson Details */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Lesson Title"
              name="title"
              value={lessonData.title}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Enter lesson title"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={lessonData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe what this lesson covers..."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Order"
              name="order"
              type="number"
              value={lessonData.order}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText="Sequence in the course"
            />
          </Grid>
        </Grid>

        {/* Existing Materials */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Existing Materials ({lessonData.materials.length})
            </Typography>

            {lessonData.materials.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No materials added yet
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {lessonData.materials.map((material, index) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {getMaterialIcon(material.type)}
                            <Typography variant="subtitle1" fontWeight="bold">
                              {material.name || 'Unnamed Material'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ({material.type})
                            </Typography>
                          </Box>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeMaterial(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {material.url}
                        </Typography>

                        {material.type === 'video' && material.url && (
                          <Box sx={{ mt: 1 }}>
                            <video 
                              controls 
                              width="100%" 
                              style={{ maxWidth: 400, borderRadius: 8 }}
                            >
                              <source src={material.url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </Box>
                        )}

                        {(material.type === 'document' || material.type === 'link') && material.url && (
                          <Button
                            variant="outlined"
                            size="small"
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 1 }}
                          >
                            Open {material.type === 'link' ? 'Link' : 'Document'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Add New Material Section */}
        {/* ... (your existing add material code) ... */}

        {/* Submit Button */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} /> : null}
          >
            {updating ? 'Updating...' : 'Update Lesson'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EditLesson;



















