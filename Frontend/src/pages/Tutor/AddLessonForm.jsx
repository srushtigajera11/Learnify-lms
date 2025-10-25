import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Typography, Box, IconButton, MenuItem, Grid,
  Card, CardContent, Alert, CircularProgress, Paper
} from '@mui/material';
import { Delete, Add, CloudUpload, ArrowBack } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

const AddLessonForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Use a single formData state instead of individual states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: ''
  });
const [materials, setMaterials] = useState([{ 
  type: 'document',  // ✅ Explicitly set type
  file: null, 
  url: '', 
  name: 'New Material'  // ✅ Give it a default name
}]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

 // In your AddLessonForm - when adding materials
const handleMaterialChange = (index, field, value) => {
  const newMaterials = [...materials];
  newMaterials[index][field] = value;
  setMaterials(newMaterials);
  
  // Debug log
  console.log(`Material ${index} ${field} changed to: ${value}`);
};

 const handleMaterialFileChange = (index, file) => {
  if (!file) return;

  const newMaterials = [...materials];
  newMaterials[index].file = file;
  newMaterials[index].name = file.name; // Make sure name is set

  if (file.type.startsWith("video/")) {
    newMaterials[index].preview = URL.createObjectURL(file);
  } else {
    newMaterials[index].preview = null;
  }

  setMaterials(newMaterials);
  
  // Debug log
  console.log(`File selected for material ${index}:`, file.name);
};

  const handleAddMaterial = () => {
    setMaterials([...materials, { type: 'document', file: null, url: '', name: '' }]);
  };

  const handleRemoveMaterial = (index) => {
    const updated = [...materials];
    updated.splice(index, 1);
    setMaterials(updated);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsUploading(true);
  setUploadSuccess(false);
  setError('');

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('order', formData.order);
    formDataToSend.append('courseId', courseId);
    formDataToSend.append('materialCount', materials.length);

    console.log("=== FRONTEND DEBUG ===");
    console.log("Materials array:", materials);

    // ✅ FIX: Properly append files to FormData
    materials.forEach((mat, index) => {
      console.log(`Material ${index}:`, mat);

      formDataToSend.append(`materials[${index}][type]`, mat.type || 'document');
      formDataToSend.append(`materials[${index}][name]`, mat.name || 'Unnamed');

      if (mat.type === 'link') {
        formDataToSend.append(`materials[${index}][url]`, mat.url || '');
        console.log(`Added link: ${mat.url}`);
      } else if (mat.file) {
        // ✅ CRITICAL FIX: Append the file with the correct field name
        formDataToSend.append(`materials[${index}][file]`, mat.file);
        console.log(`Added file: ${mat.file.name}`);
      } else if (mat.url) {
        formDataToSend.append(`materials[${index}][url]`, mat.url);
      }
    });

    // ✅ Debug: Log all FormData entries
    console.log("All FormData entries:");
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const res = await axiosInstance.post(`/lessons/${courseId}/add-lesson`, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log("Backend response:", res.data);
    setUploadSuccess(true);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      order: ''
    });
    setMaterials([{ type: 'document', file: null, url: '', name: 'New Material' }]);
    
  } catch (err) {
    console.error('Add Lesson Error:', err);
    console.error('Error response:', err.response?.data);
    setError(err.response?.data?.message || 'Failed to add lesson');
  } finally {
    setIsUploading(false);
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
          Back to Course
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Add New Lesson
        </Typography>
      </Box>

      {/* Messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>Lesson created successfully!</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Lesson Details */}
          <Grid item xs={12}>
            <TextField
              label="Lesson Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              fullWidth
              required
              margin="normal"
              placeholder="Enter lesson title"
              disabled={isUploading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              placeholder="Describe what students will learn..."
              disabled={isUploading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', e.target.value)}
              fullWidth
              margin="normal"
              inputProps={{ min: 1 }}
              disabled={isUploading}
            />
          </Grid>
        </Grid>

        {/* Materials Section */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lesson Materials
            </Typography>

            {materials.map((mat, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Type"
                      fullWidth
                      value={mat.type}
                      onChange={(e) => handleMaterialChange(index, 'type', e.target.value)}
                      disabled={isUploading}
                    >
                      <MenuItem value="video">Video</MenuItem>
                      <MenuItem value="document">Document</MenuItem>
                      <MenuItem value="link">Link</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    {mat.type === 'link' ? (
                      <TextField
                        label="URL"
                        fullWidth
                        value={mat.url}
                        onChange={(e) => handleMaterialChange(index, 'url', e.target.value)}
                        disabled={isUploading}
                        placeholder="https://example.com"
                      />
                    ) : (
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<CloudUpload />}
                        disabled={isUploading}
                      >
                        {mat.file ? mat.file.name : `Upload ${mat.type}`}
                        <input
                          type="file"
                          hidden
                          accept={mat.type === 'video' ? 'video/*' : '*'}
                          onChange={(e) => handleMaterialFileChange(index, e.target.files[0])}
                        />
                      </Button>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveMaterial(index)}
                      disabled={isUploading || materials.length === 1}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>

                  {/* Video Preview */}
                  {mat.preview && mat.type === 'video' && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Video Preview:
                      </Typography>
                      <video
                        width="100%"
                        height="auto"
                        controls
                        src={mat.preview}
                        style={{ maxWidth: 400, borderRadius: 8 }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Card>
            ))}

            <Button 
              onClick={handleAddMaterial} 
              variant="outlined" 
              startIcon={<Add />}
              disabled={isUploading}
              sx={{ mt: 1 }}
            >
              Add Another Material
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Creating Lesson...' : 'Create Lesson'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddLessonForm;