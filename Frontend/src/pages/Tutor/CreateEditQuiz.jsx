import { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Cancel,
  CheckCircle,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

export default function EditQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
      console.log('Quiz data loaded:', response.data.data);
      setQuizData(response.data.data);
    } catch (err) {
      console.error('Load quiz error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      questionText: '',
      questionType: 'multiple-choice',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
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

      const correctAnswers = question.options.filter(opt => opt.isCorrect);
      if (correctAnswers.length === 0) {
        setError(`Question ${i + 1} must have one correct answer`);
        return;
      }
      
      if (correctAnswers.length > 1) {
        setError(`Question ${i + 1} can only have one correct answer`);
        return;
      }
    }

    setSaving(true);
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
          }))
        }))
      };

      console.log('Saving quiz data:', cleanQuizData);
      
      await axiosInstance.put(`/quizzes/quiz/${quizId}`, cleanQuizData);
      navigate(`/tutor/course/${courseId}/quizzes`);
    } catch (err) {
      console.error('API Error:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  // Check if quiz is valid for saving
  const isQuizValid = () => {
    if (!quizData) return false;
    if (!quizData.title.trim()) return false;
    
    return quizData.questions.every(question => 
      question.questionText.trim() &&
      question.options.filter(opt => opt.text.trim() !== '').length >= 2 &&
      question.options.some(opt => opt.isCorrect)
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !quizData) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!quizData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Quiz not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Edit Quiz
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
            disabled={saving || !isQuizValid()}
            startIcon={<Save />}
          >
            {saving ? 'Saving...' : 'Update Quiz'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left Column - Quiz Settings */}
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

          {/* Quiz Validation Check */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Validation Check
              </Typography>
              
              {quizData.questions.map((question, index) => {
                const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
                const validOptions = question.options.filter(opt => opt.text.trim() !== '');
                
                return (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {hasCorrectAnswer && validOptions.length >= 2 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                    <Typography variant="body2">
                      Question {index + 1}: {hasCorrectAnswer ? '✓ Has correct answer' : '✗ Missing correct answer'}
                    </Typography>
                  </Box>
                );
              })}
              
              {/* Overall status */}
              <Divider sx={{ my: 2 }} />
              <Typography 
                variant="body1" 
                color={
                  quizData.questions.every(q => 
                    q.options.some(opt => opt.isCorrect) && 
                    q.options.filter(opt => opt.text.trim() !== '').length >= 2
                  ) ? 'success.main' : 'error.main'
                }
              >
                {quizData.questions.every(q => 
                  q.options.some(opt => opt.isCorrect) && 
                  q.options.filter(opt => opt.text.trim() !== '').length >= 2
                ) 
                  ? '✓ All questions are valid and ready to save!' 
                  : '✗ Some questions need attention before saving'
                }
              </Typography>
            </CardContent>
          </Card>

          {/* Quiz Summary */}
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

        {/* Right Column - Questions */}
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

          {quizData.questions.map((question, questionIndex) => {
            const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
            
            return (
              <Card key={question._id || questionIndex} sx={{ mb: 3 }}>
                <CardContent>
                  {/* Question Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" component="h3">
                        Question {questionIndex + 1}
                      </Typography>
                      <Chip label={`${question.points} pt${question.points !== 1 ? 's' : ''}`} size="small" />
                      
                      {/* Warning if no correct answer */}
                      {!hasCorrectAnswer && (
                        <Chip
                          label="Missing correct answer!"
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => deleteQuestion(questionIndex)}
                      disabled={quizData.questions.length <= 1}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  {/* Question Text */}
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

                  {/* Question Settings */}
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

                  {/* Options */}
                  <Typography variant="subtitle2" component="p" gutterBottom>
                    Options (Select the correct answer):
                  </Typography>

                  {question.options.map((option, optionIndex) => (
                    <Box
                      key={option._id || optionIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 1,
                        p: 2,
                        border: '1px solid',
                        borderColor: option.isCorrect ? 'success.main' : 'divider',
                        borderRadius: 1,
                        backgroundColor: option.isCorrect ? 'success.light' : 'background.paper',
                        transition: 'all 0.2s',
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
                        error={option.isCorrect && !option.text.trim()}
                        helperText={option.isCorrect && !option.text.trim() ? 'Correct answer cannot be empty' : ''}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteOption(questionIndex, optionIndex)}
                        disabled={question.options.length <= 2}
                      >
                        <Delete />
                      </IconButton>
                      
                      {/* Badge for correct answer */}
                      {option.isCorrect && (
                        <Chip
                          label="Correct Answer"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
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
            );
          })}

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