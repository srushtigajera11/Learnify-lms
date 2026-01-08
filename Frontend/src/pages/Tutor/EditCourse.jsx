import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Grid,
  InputAdornment,
  Card,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { 
  CloudUpload, 
  Save, 
  ArrowBack, 
  Send,
  Info,
  CheckCircle,
  Cancel 
} from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    category: "",
    price: 0,
    thumbnail: "",
    objectives: [],
    requirements: [],
    level: "beginner",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

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

  // Get status color and chip
  const getStatusChip = (status) => {
    const statusConfig = {
      draft: { color: 'default', label: 'Draft', icon: <Info /> },
      pending: { color: 'warning', label: 'Pending Review', icon: <CircularProgress size={16} /> },
      published: { color: 'success', label: 'Published', icon: <CheckCircle /> },
      rejected: { color: 'error', label: 'Rejected', icon: <Cancel /> },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant="outlined"
        size="small"
        sx={{ ml: 1 }}
      />
    );
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setFetchLoading(true);
        const res = await axiosInstance.get(`/courses/mine/${courseId}`);
        const { 
          title, 
          description, 
          thumbnail, 
          status, 
          category, 
          price,
          objectives,
          requirements,
          level,
          adminFeedback 
        } = res.data;
        
        setFormData({ 
          title, 
          description, 
          thumbnail, 
          status, 
          category, 
          price,
          objectives: objectives?.join('\n') || '',
          requirements: requirements?.join('\n') || '',
          level: level || 'beginner'
        });
        setThumbnailPreview(thumbnail);
        setAdminFeedback(adminFeedback || '');
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Failed to load course details");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
    setError("");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e, action = 'save') => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    // If submitting for review
    if (action === 'submit') {
      if (!thumbnailPreview) {
        setError("Thumbnail is required when submitting for review");
        return;
      }
      if (!formData.category) {
        setError("Category is required when submitting for review");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formToSend = new FormData();
      formToSend.append("title", formData.title.trim());
      formToSend.append("description", formData.description.trim());
      formToSend.append("category", formData.category);
      formToSend.append("price", formData.price);
      formToSend.append("level", formData.level);
      
      // Handle objectives and requirements
      if (formData.objectives) {
        const objectivesArray = formData.objectives.split('\n').filter(obj => obj.trim());
        objectivesArray.forEach(obj => formToSend.append('objectives', obj.trim()));
      }
      
      if (formData.requirements) {
        const requirementsArray = formData.requirements.split('\n').filter(req => req.trim());
        requirementsArray.forEach(req => formToSend.append('requirements', req.trim()));
      }
      
      if (thumbnailFile) {
        formToSend.append("thumbnail", thumbnailFile);
      }

      // Update course
      await axiosInstance.put(`/courses/mine/${courseId}`, formToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // If submitting for review
      if (action === 'submit') {
        await axiosInstance.put(`/courses/${courseId}/submit`);
        setSuccess("Course submitted for admin approval!");
        setShowSubmitDialog(false);
      } else {
        setSuccess("Course updated successfully!");
      }

      // Refresh course data
      setTimeout(() => {
        navigate(0); // Refresh page
      }, 1500);
      
    } catch (err) {
      console.error("Failed to update course:", err);
      setError(err.response?.data?.message || "Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = () => {
    // Check if course can be submitted
    if (formData.status !== 'draft' && formData.status !== 'rejected') {
      setError(`Cannot submit a ${formData.status} course for review`);
      return;
    }
    setShowSubmitDialog(true);
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ maxWidth: 1000, mx: 'auto', mt: 3, p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate("/tutor/courses")}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Edit Course
            </Typography>
            {getStatusChip(formData.status)}
          </Box>
          
          {/* Show admin feedback if rejected */}
          {formData.status === 'rejected' && adminFeedback && (
            <Alert 
              severity="warning" 
              icon={<Info />}
              sx={{ maxWidth: 400 }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Admin Feedback:
              </Typography>
              <Typography variant="body2">
                {adminFeedback}
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Messages */}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={(e) => handleSubmit(e, 'save')}>
          <Grid container spacing={3}>
            {/* Left Column - Form Fields */}
            <Grid item xs={12} md={8}>
              <TextField
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                placeholder="Enter course title"
              />

              <TextField
                label="Course Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                margin="normal"
                placeholder="Describe what students will learn..."
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      label="Category"
                      onChange={handleChange}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Difficulty Level</InputLabel>
                    <Select
                      name="level"
                      value={formData.level}
                      label="Difficulty Level"
                      onChange={handleChange}
                    >
                      {levels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>

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

            {/* Right Column - Thumbnail */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 2 }}>
                {thumbnailPreview ? (
                  <CardMedia
                    component="img"
                    image={thumbnailPreview}
                    alt="Course thumbnail"
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
                    <Typography>No Thumbnail</Typography>
                  </Box>
                )}
              </Card>

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Upload Thumbnail
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleThumbnailChange} 
                />
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Recommended: 400x300px, max 5MB
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                
                {(formData.status === 'draft' || formData.status === 'rejected') && (
                  <Button 
                    variant="outlined" 
                    color="primary"
                    disabled={loading || !thumbnailPreview || !formData.category}
                    startIcon={<Send />}
                    onClick={handleSubmitForReview}
                  >
                    Submit for Review
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Submit for Review Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit for Review</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit this course for admin approval?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              • Once submitted, you cannot edit the course until it's approved or rejected<br/>
              • Admin will review your course within 1-2 business days<br/>
              • You will receive a notification when your course is reviewed
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={(e) => handleSubmit(e, 'submit')} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditCourse;