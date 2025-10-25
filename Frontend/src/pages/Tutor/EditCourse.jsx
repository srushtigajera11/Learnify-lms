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
} from "@mui/material";
import { CloudUpload, Save, ArrowBack } from "@mui/icons-material";
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
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const categories = [
    'Web Development',
    'App Development', 
    'MERN Stack',
    'React',
    'Communication',
    'Python',
    'UI/UX'
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setFetchLoading(true);
        const res = await axiosInstance.get(`/courses/my-course/${courseId}`);
        const { title, description, thumbnail, status, category, price } = res.data;
        setFormData({ title, description, thumbnail, status, category, price });
        setThumbnailPreview(thumbnail);
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
    // Clear messages when user starts typing
    setSuccess("");
    setError("");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formToSend = new FormData();
      formToSend.append("title", formData.title.trim());
      formToSend.append("description", formData.description.trim());
      formToSend.append("status", formData.status);
      formToSend.append("category", formData.category);
      formToSend.append("price", formData.price);
      
      if (thumbnailFile) {
        formToSend.append("thumbnail", thumbnailFile);
      }

      await axiosInstance.put(`/courses/${courseId}`, formToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Course updated successfully!");
      setTimeout(() => navigate("/tutor/my-courses"), 1500);
    } catch (err) {
      console.error("Failed to update course:", err);
      setError(err.response?.data?.message || "Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', mt: 3, p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate("/tutor/my-courses")}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Edit Course
        </Typography>
      </Box>

      {/* Messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
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
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
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
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate("/tutor/my-courses")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EditCourse;