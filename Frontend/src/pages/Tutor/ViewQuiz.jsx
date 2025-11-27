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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  Delete,
  Quiz,
  Assignment,
  BarChart,
  People,
  Publish,
  Unpublished,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

export default function ViewQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, quiz: null });
  const [publishLoading, setPublishLoading] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

const fetchQuizzes = async () => {
  try {
    setLoading(true);
    // Change from: /courses/${courseId}/quizzes
    // To: /quizzes/${courseId}
    const response = await axiosInstance.get(`/quizzes/${courseId}`);
    console.log('Quizzes response:', response);
    setQuizzes(response.data.data);
  } catch (err) {
    console.error('Load quizzes error:', err);
    console.error('Error response:', err.response?.data);
    setError(err.response?.data?.message || 'Failed to load quizzes');
  } finally {
    setLoading(false);
  }
};

const handleDeleteQuiz = async (quizId) => {
  if (window.confirm('Are you sure you want to delete this quiz?')) {
    try {
      // This stays the same: /quizzes/quiz/${quizId}
      await axiosInstance.delete(`/quizzes/quiz/${quizId}`);
      fetchQuizzes();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete quiz');
    }
  }
};

const handlePublishToggle = async (quiz) => {
  setPublishLoading(quiz._id);
  try {
    // This stays the same: /quizzes/quiz/${quiz._id}/publish
    await axiosInstance.patch(`/quizzes/quiz/${quiz._id}/publish`);
    fetchQuizzes();
  } catch (err) {
    console.error('Publish error:', err);
    setError(err.response?.data?.message || 'Failed to update quiz status');
  } finally {
    setPublishLoading(null);
  }
};

 

  const getTotalPoints = (quiz) => {
    return quiz.questions.reduce((total, question) => total + question.points, 0);
  };

  const getQuestionTypeCount = (quiz) => {
    const counts = { 'multiple-choice': 0, 'true-false': 0 };
    quiz.questions.forEach(q => {
      counts[q.questionType] = (counts[q.questionType] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography component="div">Loading quizzes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Course Quizzes
          </Typography>
          <Typography variant="body1" component="p" color="text.secondary">
            Manage and review all quizzes for this course
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/tutor/course/${courseId}/quizzes/create`)}
        >
          Create Quiz
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Quiz color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="primary">
                {quizzes.length}
              </Typography>
              <Typography variant="body2" component="div" color="text.secondary">
                Total Quizzes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main">
                {quizzes.filter(q => q.isPublished).length}
              </Typography>
              <Typography variant="body2" component="div" color="text.secondary">
                Published
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BarChart color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="warning.main">
                {quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
              </Typography>
              <Typography variant="body2" component="div" color="text.secondary">
                Total Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="info.main">
                {quizzes.reduce((total, quiz) => total + getTotalPoints(quiz), 0)}
              </Typography>
              <Typography variant="body2" component="div" color="text.secondary">
                Total Points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {quizzes.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Quiz Title</TableCell>
                    <TableCell>Questions</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Passing Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizzes.map((quiz) => {
                    const questionCounts = getQuestionTypeCount(quiz);
                    return (
                      <TableRow key={quiz._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle1" component="div" fontWeight="bold">
                              {quiz.title}
                            </Typography>
                            <Typography variant="body2" component="div" color="text.secondary">
                              {quiz.description || 'No description'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" component="div">
                              {quiz.questions.length} questions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {questionCounts['multiple-choice'] > 0 && (
                                <Chip label={`${questionCounts['multiple-choice']} MC`} size="small" />
                              )}
                              {questionCounts['true-false'] > 0 && (
                                <Chip label={`${questionCounts['true-false']} TF`} size="small" color="secondary" />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getTotalPoints(quiz)} 
                            color="primary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" component="div">
                            {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${quiz.passingScore}%`} 
                            color={quiz.passingScore > 70 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={quiz.isPublished}
                                onChange={() => handlePublishToggle(quiz)}
                                disabled={publishLoading === quiz._id}
                                size="small"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {quiz.isPublished ? <Publish fontSize="small" /> : <Unpublished fontSize="small" />}
                                <Typography variant="body2" component="span">
                                  {quiz.isPublished ? 'Published' : 'Draft'}
                                </Typography>
                              </Box>
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" component="div">
                            {new Date(quiz.updatedAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" component="div" color="text.secondary">
                            {new Date(quiz.updatedAt).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quiz._id}/edit`)}
                              title="Edit Quiz"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quiz._id}/preview`)}
                              title="Preview Quiz"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, quiz })}
                              title="Delete Quiz"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" component="h2" color="text.secondary" gutterBottom>
                No Quizzes Created Yet
              </Typography>
              <Typography variant="body2" component="p" color="text.secondary" sx={{ mb: 3 }}>
                Create your first quiz to start assessing your students' knowledge.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate(`/tutor/course/${courseId}/quizzes/create`)}
              >
                Create First Quiz
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, quiz: null })}
      >
        <DialogTitle>
          Delete Quiz
        </DialogTitle>
        <DialogContent>
          <Typography component="div">
            Are you sure you want to delete the quiz "{deleteDialog.quiz?.title}"? 
            This action cannot be undone and all quiz attempts will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, quiz: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteQuiz(deleteDialog.quiz?._id)} 
            color="error"
            variant="contained"
          >
            Delete Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}