// ViewQuiz.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

export default function ViewQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

const fetchQuizzes = async () => {
  try {
    // Change from: /courses/${courseId}/quizzes
    // To: /quizzes/${courseId}
    const response = await axiosInstance.get(`/quizzes/${courseId}`);
    setQuizzes(response.data.data);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load quizzes');
  } finally {
    setLoading(false);
  }
};

const handleDeleteQuiz = async (quizId) => {
  if (window.confirm('Are you sure you want to delete this quiz?')) {
    try {
      // This should work as-is: /quizzes/quiz/${quizId}
      await axiosInstance.delete(`/quizzes/quiz/${quizId}`);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete quiz');
    }
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Course Quizzes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/tutor/course/${courseId}/quizzes/create`)}
        >
          Create Quiz
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quiz Title</TableCell>
                  <TableCell>Lesson</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Passing Score</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz._id}>
                    <TableCell>
                      <Typography variant="subtitle2">{quiz.title}</Typography>
                    </TableCell>
                    <TableCell>{quiz.lesson?.title || 'No Lesson'}</TableCell>
                    <TableCell>{quiz.duration} min</TableCell>
                    <TableCell>{quiz.passingScore}%</TableCell>
                    <TableCell>{quiz.questions?.length || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={quiz.isPublished ? 'Published' : 'Draft'}
                        color={quiz.isPublished ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quiz._id}/edit`)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quiz._id}/questions`)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {quizzes.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No quizzes created yet. Create your first quiz to get started.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}