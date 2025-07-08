import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  TextField, Button, Typography, Box, IconButton, MenuItem, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../utils/axiosInstance';
import { CircularProgress, Alert } from '@mui/material';



const AddLessonForm = () => {
  const { courseId } = useParams();
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false); // ✅ Success message state
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('');
  const [materials, setMaterials] = useState([{ type: 'document', file: null, url: '', name: '' }]);
  const [videoFile , setVideoFile] = useState(null);
  const [videoPreview , SetVideoPreview] = useState(null);



  // ... (handlers remain same)
  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };
  

  const handleMaterialFileChange = (index, file) => {
    const newMaterials = [...materials];
    newMaterials[index].file = file;
    newMaterials[index].name = file.name;
  
    if (file && file.type.startsWith("video/")) {
      newMaterials[index].preview = URL.createObjectURL(file);
    } else {
      newMaterials[index].preview = null;
    }
  
    setMaterials(newMaterials);
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
    setUploadSuccess(false); // Reset success message

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('order', order);
      formData.append('courseId', courseId);
      formData.append('materialCount', materials.length);

      materials.forEach((mat, index) => {
        formData.append(`materials[${index}][type]`, mat.type);
        formData.append(`materials[${index}][name]`, mat.name || 'Unnamed');

        if (mat.type === 'link') {
          formData.append(`materials[${index}][url]`, mat.url);
        } else if (mat.file) {
          formData.append(`materials[${index}][file]`, mat.file);
        }
      });

      const res = await axiosInstance.post(`/lessons/${courseId}/add-lesson`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadSuccess(true); // ✅ Show success message
      setTitle('');
      setDescription('');
      setOrder('');
      setMaterials([{ type: 'document', file: null, url: '', name: '' }]);
    } catch (err) {
      console.error('Add Lesson Error:', err);
      alert(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Add New Lesson</Typography>

      <TextField
        label="Lesson Title"
        fullWidth
        required
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isUploading}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={2}
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isUploading}
      />

      <TextField
        label="Order"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
        disabled={isUploading}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>Materials</Typography>

      {materials.map((mat, index) => (
        <Grid container spacing={2} key={index} alignItems="center">
        <Grid item xs={3}>
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
      
        <Grid item xs={6}>
          {mat.type === 'link' ? (
            <TextField
              label="URL"
              fullWidth
              value={mat.url}
              onChange={(e) => handleMaterialChange(index, 'url', e.target.value)}
              disabled={isUploading}
            />
          ) : (
            <Button
              variant="contained"
              component="label"
              fullWidth
              disabled={isUploading}
            >
              {mat.file ? mat.file.name : 'Upload File'}
              <input
                type="file"
                hidden
                onChange={(e) => handleMaterialFileChange(index, e.target.files[0])}
              />
            </Button>
          )}
        </Grid>
      
        <Grid item xs={2}>
          <IconButton
            color="error"
            onClick={() => handleRemoveMaterial(index)}
            disabled={isUploading}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      
        {/* Video Preview */}
        {mat.preview && mat.type === 'video' && (
  <Grid item xs={12}>
    <video
      width="60%"
      height="auto"
      controls
      src={mat.preview}
      style={{ marginTop: 8, borderRadius: 8 }}
    />
  </Grid>
)}
      </Grid>
      
      ))}

      <Box sx={{ mt: 2 }}>
        <Button onClick={handleAddMaterial} variant="outlined" disabled={isUploading}>
          + Add Material
        </Button>
      </Box>

      <Box sx={{ mt: 3, position: 'relative' }}>
        <Button type="submit" variant="contained" color="primary" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Submit Lesson'}
        </Button>
        {isUploading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '130px',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
      

      {uploadSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Lesson uploaded successfully!
        </Alert>
      )}
    </Box>
  );
};


export default AddLessonForm;

