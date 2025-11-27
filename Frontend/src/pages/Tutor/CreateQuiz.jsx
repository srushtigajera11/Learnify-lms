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
  IconButton,
  Grid,
  Alert,
  Radio,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Cancel,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

export default function CreateEditQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(false);

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 1,
    shuffleQuestions: false,
    isPublished: false,
    questions: [
      {
        _id: `temp-${Date.now()}-1`,
        questionText: '',
        questionType: 'multiple-choice',
        options: [
          { _id: `temp-${Date.now()}-opt-1`, text: '', isCorrect: true },
          { _id: `temp-${Date.now()}-opt-2`, text: '', isCorrect: false },
        ],
        points: 1,
      },
    ],
  });

  const addQuestion = () => {
    const newQuestion = {
      _id: `temp-${Date.now()}-${quizData.questions.length + 1}`,
      questionText: '',
      questionType: 'multiple-choice',
      options: [
        { _id: `temp-${Date.now()}-opt-1`, text: '', isCorrect: true },
        { _id: `temp-${Date.now()}-opt-2`, text: '', isCorrect: false },
      ],
      points: 1,
    };
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    });
  };

  const updateQuestion = (questionIndex, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const deleteQuestion = (questionIndex) => {
    if (quizData.questions.length <= 1) {
      setError('Quiz must have at least one question');
      return;
    }
    const updatedQuestions = quizData.questions.filter(
      (_, index) => index !== questionIndex
    );
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...quizData.questions];
    const newOption = {
      _id: `temp-${Date.now()}-opt-${updatedQuestions[questionIndex].options.length + 1}`,
      text: '',
      isCorrect: false,
    };
    updatedQuestions[questionIndex].options.push(newOption);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...quizData.questions];
    
    if (field === 'isCorrect' && value === true) {
      updatedQuestions[questionIndex].options.forEach((opt, idx) => {
        opt.isCorrect = idx === optionIndex;
      });
    } else {
      updatedQuestions[questionIndex].options[optionIndex][field] = value;
    }
    
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const deleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    if (updatedQuestions[questionIndex].options.length <= 2) {
      setError('Question must have at least 2 options');
      return;
    }
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

 const handleSaveQuiz = async () => {
  if (!quizData.title.trim()) {
    setError('Quiz title is required');
    return;
  }

  // Validate questions
  for (let i = 0; i < quizData.questions.length; i++) {
    const question = quizData.questions[i];
    if (!question.questionText.trim()) {
      setError(`Question ${i + 1} text is required`);
      return;
    }
    
    const validOptions = question.options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      setError(`Question ${i + 1} must have at least 2 valid options`);
      return;
    }
    
    const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      setError(`Question ${i + 1} must have one correct answer`);
      return;
    }
  }

  setLoading(true);
  try {
    // Clean up the data before sending to backend
    const cleanQuizData = {
      title: quizData.title,
      description: quizData.description,
      timeLimit: quizData.timeLimit,
      passingScore: quizData.passingScore,
      maxAttempts: quizData.maxAttempts,
      shuffleQuestions: quizData.shuffleQuestions,
      isPublished: quizData.isPublished,
      questions: quizData.questions.map(question => ({
        questionText: question.questionText,
        questionType: question.questionType,
        points: question.points,
        options: question.options.map(option => ({
          text: option.text,
          isCorrect: option.isCorrect
          // Remove the _id field - let MongoDB generate it
        }))
        // Remove the _id field from question too
      }))
    };

    console.log('Cleaned quiz data:', cleanQuizData);
    
    if (isEditing) {
      await axiosInstance.put(`/quizzes/quiz/${quizId}`, cleanQuizData);
    } else {
      await axiosInstance.post(`/quizzes/${courseId}`, cleanQuizData);
    }
    
    navigate(`/tutor/course/${courseId}/quizzes`);
  } catch (err) {
    console.error('API Error:', err);
    console.error('Error details:', err.response?.data);
    setError(err.response?.data?.message || 'Failed to save quiz');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuiz}
            disabled={loading}
            startIcon={<Save />}
          >
            {loading ? 'Saving...' : 'Save Quiz'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Settings
              </Typography>

              <TextField
                fullWidth
                label="Quiz Title"
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                margin="normal"
              />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Time Limit (minutes)"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Passing Score %"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="number"
                label="Max Attempts"
                value={quizData.maxAttempts}
                onChange={(e) => setQuizData({ ...quizData, maxAttempts: parseInt(e.target.value) || 1 })}
                margin="normal"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={quizData.shuffleQuestions}
                    onChange={(e) => setQuizData({ ...quizData, shuffleQuestions: e.target.checked })}
                  />
                }
                label="Shuffle Questions"
                sx={{ mt: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={quizData.isPublished}
                    onChange={(e) => setQuizData({ ...quizData, isPublished: e.target.checked })}
                  />
                }
                label="Publish Quiz"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" component="span">
                    Questions:
                  </Typography>
                  <Chip label={quizData.questions.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" component="span">
                    Total Points:
                  </Typography>
                  <Chip label={quizData.questions.reduce((sum, q) => sum + q.points, 0)} size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" component="span">
                    Status:
                  </Typography>
                  <Chip 
                    label={quizData.isPublished ? 'Published' : 'Draft'} 
                    color={quizData.isPublished ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Questions ({quizData.questions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </Box>

          {quizData.questions.map((question, questionIndex) => (
            <Card key={question._id} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" component="h3">
                      Question {questionIndex + 1}
                    </Typography>
                    <Chip label={`${question.points} pt${question.points !== 1 ? 's' : ''}`} size="small" />
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => deleteQuestion(questionIndex)}
                    disabled={quizData.questions.length <= 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Question Text"
                  value={question.questionText}
                  onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                  margin="normal"
                  required
                />

                <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Question Type</InputLabel>
                      <Select
                        value={question.questionType}
                        label="Question Type"
                        onChange={(e) => updateQuestion(questionIndex, 'questionType', e.target.value)}
                      >
                        <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                        <MenuItem value="true-false">True/False</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Points"
                      value={question.points}
                      onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" component="p" gutterBottom>
                  Options (Select the correct answer):
                </Typography>

                {question.options.map((option, optionIndex) => (
                  <Box
                    key={option._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 1,
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Radio
                      checked={option.isCorrect}
                      onChange={(e) => updateOption(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteOption(questionIndex, optionIndex)}
                      disabled={question.options.length <= 2}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => addOption(questionIndex)}
                  sx={{ mt: 1 }}
                  disabled={question.options.length >= 6}
                >
                  Add Option ({question.options.length}/6)
                </Button>
              </CardContent>
            </Card>
          ))}

          {quizData.questions.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" component="h3" color="text.secondary" gutterBottom>
                No Questions Added Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start by adding your first question to create the quiz.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={addQuestion}>
                Add First Question
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}