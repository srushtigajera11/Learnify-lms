// CreateQuiz.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Alert,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

export default function CreateQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lessonId: '',
    questions: [],
    duration: 30, // minutes
    passingScore: 60, // percentage
    maxAttempts: 1,
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Change from: /courses/${courseId}/quizzes
    // To: /quizzes/${courseId}/add-quiz
    const response = await axiosInstance.post(`/quizzes/${courseId}/add-quiz`, formData);
    navigate(`/tutor/course/${courseId}/quizzes`);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create quiz');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create New Quiz
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Associated Lesson</InputLabel>
                  <Select
                    value={formData.lessonId}
                    label="Associated Lesson"
                    onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                    required
                  >
                    {/* You'll need to fetch lessons for this course */}
                    <MenuItem value="lesson1">Lesson 1: Introduction</MenuItem>
                    <MenuItem value="lesson2">Lesson 2: Basics</MenuItem>
                  </Select>
                  <FormHelperText>Select which lesson this quiz belongs to</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Passing Score (%)"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Attempts"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
                    startIcon={<Cancel />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<Save />}
                  >
                    {loading ? 'Creating...' : 'Create Quiz'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}