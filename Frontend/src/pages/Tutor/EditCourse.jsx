import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
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
} from "@mui/material";
import axiosInstance from "../../utils/axiosInstance";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    thumbnail: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}`);
        const { title, description, thumbnail, status } = res.data;
        setFormData({ title, description, thumbnail, status });
        setThumbnailPreview(thumbnail);
      } catch (err) {
        console.error("Failed to fetch course:", err);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const formToSend = new FormData();
      formToSend.append("title", formData.title);
      formToSend.append("description", formData.description);
      formToSend.append("status", formData.status);
      if (thumbnailFile) {
        formToSend.append("thumbnail", thumbnailFile);
      }

      await axiosInstance.put(`/courses/${courseId}`, formToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => navigate(`/tutor/dashboard`), 1000);
    } catch (err) {
      console.error("Failed to update course:", err);
      alert(err.response?.data?.message || "Failed to update course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, maxWidth: 650, mx: "auto", px: 2 }}>
      <Typography variant="h4" gutterBottom>Edit Course</Typography>

      <TextField
        label="Course Title"
        name="title"
        placeholder={formData.title || "Enter course title"}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Course Description"
        name="description"
        placeholder={formData.description || "Enter course description"}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />

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

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" component="label">
          Upload Thumbnail
          <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
        </Button>
      </Box>

      {thumbnailPreview && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Thumbnail Preview:</Typography>
          <img src={thumbnailPreview} alt="Thumbnail" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </Box>
      )}

      <Box sx={{ mt: 3, position: "relative" }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Saving..." : "💾 Save Changes"}
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              position: "absolute",
              top: "50%",
              left: "140px",
              marginTop: "-12px",
              marginLeft: "-12px",
            }}
          />
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Course updated successfully!
        </Alert>
      )}
    </Box>
  );
};

export default EditCourse;
