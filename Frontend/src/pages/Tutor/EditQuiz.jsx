import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  Switch,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Alert,
  Stack,
  FormControlLabel,   // <— Correct import here
} from "@mui/material";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  RadioButtonUnchecked as RadioIcon,
  RadioButtonChecked as RadioCheckedIcon,
} from "@mui/icons-material";

import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";



export default function EditQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [openQ, setOpenQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch Quiz
  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const res = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
      const data = res.data.data;

      // Ensure options have IDs
      const mapped = {
        ...data,
        questions: data.questions.map((q) => ({
          ...q,
          options: q.options.map((o, idx) => ({
            ...o,
            id: o._id || `opt-${idx}-${Date.now()}`,
          })),
        })),
      };

      setQuizData(mapped);
    } catch (err) {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // Add Question
  const addQuestion = () => {
    const newQ = {
      questionText: "",
      questionType: "multiple-choice",
      points: 1,
      options: [
        { id: `opt1-${Date.now()}`, text: "", isCorrect: true },
        { id: `opt2-${Date.now()}`, text: "", isCorrect: false },
      ],
    };
    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setOpenQ(quizData.questions.length);
  };

  // Delete Question
  const deleteQuestion = (i) => {
    if (quizData.questions.length <= 1) {
      setError("Quiz must contain at least 1 question.");
      return;
    }
    const copy = [...quizData.questions];
    copy.splice(i, 1);
    setQuizData({ ...quizData, questions: copy });
    setOpenQ(Math.max(0, i - 1));
  };

  // Update Question Field
  const updateQuestion = (i, field, value) => {
    const copy = [...quizData.questions];
    copy[i][field] = value;
    setQuizData({ ...quizData, questions: copy });
  };

  // Add Option
  const addOption = (qi) => {
    const newOpt = { id: `opt-${Date.now()}`, text: "", isCorrect: false };
    const copy = [...quizData.questions];
    copy[qi].options.push(newOpt);
    setQuizData({ ...quizData, questions: copy });
  };

  // Delete Option
  const deleteOption = (qi, oi) => {
    const copy = [...quizData.questions];
    if (copy[qi].options.length <= 2) {
      setError("Each question must have at least 2 options.");
      return;
    }
    copy[qi].options.splice(oi, 1);
    // Ensure at least one isCorrect
    if (!copy[qi].options.some((o) => o.isCorrect)) {
      copy[qi].options[0].isCorrect = true;
    }
    setQuizData({ ...quizData, questions: copy });
  };

  // Update Option
  const updateOption = (qi, oi, field, value) => {
    const copy = [...quizData.questions];

    if (field === "isCorrect") {
      copy[qi].options.forEach((o, idx) => {
        o.isCorrect = idx === oi;
      });
    } else {
      copy[qi].options[oi][field] = value;
    }
    setQuizData({ ...quizData, questions: copy });
  };

  // Validation
  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      setError("Quiz title is required.");
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: text required.`);
        return false;
      }
      const validOpts = q.options.filter((o) => o.text.trim() !== "");
      if (validOpts.length < 2) {
        setError(`Question ${i + 1}: must have at least 2 valid options.`);
        return false;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        setError(`Question ${i + 1}: mark a correct option.`);
        return false;
      }
    }
    return true;
  };

  // Save Quiz
  const saveQuiz = async () => {
    if (!validateQuiz()) return;

    setSaving(true);
    try {
      const clean = {
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        maxAttempts: quizData.maxAttempts,
        shuffleQuestions: quizData.shuffleQuestions,
        isPublished: quizData.isPublished,
        questions: quizData.questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          options: q.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        })),
      };

      await axiosInstance.put(`/quizzes/quiz/${quizId}`, clean);
      navigate(`/tutor/course/${courseId}/quizzes`);
    } catch (err) {
      setError("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  
  if (!quizData) return <Alert severity="error">Quiz not found</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Edit Quiz
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveQuiz}
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Quiz"}
          </Button>
        </Stack>
      </Box>

      {error && <Alert sx={{ mb: 2 }} severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {/* LEFT SIDEBAR */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>Quiz Settings</Typography>

              <TextField
                label="Quiz Title"
                fullWidth
                sx={{ mt: 2 }}
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 2 }}
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
              />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Time (mins)"
                    type="number"
                    fullWidth
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: e.target.value })}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Passing %"
                    type="number"
                    fullWidth
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: e.target.value })}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Max Attempts"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={quizData.maxAttempts}
                onChange={(e) => setQuizData({ ...quizData, maxAttempts: e.target.value })}
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
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2">Summary</Typography>
              <Chip label={`Questions: ${quizData.questions.length}`} sx={{ mr: 1, mt: 1 }} />
              <Chip label={`Points: ${quizData.questions.reduce((s, q) => s + q.points, 0)}`} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SIDE — QUESTIONS */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Questions
            </Typography>

            <Button startIcon={<AddIcon />} variant="contained" onClick={addQuestion}>
              Add Question
            </Button>
          </Box>

          {quizData.questions.map((q, qi) => (
            <Accordion
              key={qi}
              expanded={openQ === qi}
              onChange={() => setOpenQ(openQ === qi ? -1 : qi)}
              sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  Q{qi + 1}. {q.questionText || "Untitled question"}
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                {/* Question Text */}
                <TextField
                  label="Question Text"
                  fullWidth
                  multiline
                  rows={2}
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
                />

                {/* Question Settings */}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        label="Type"
                        value={q.questionType}
                        onChange={(e) => updateQuestion(qi, "questionType", e.target.value)}
                      >
                        <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                        <MenuItem value="true-false">True/False</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label="Points"
                      type="number"
                      fullWidth
                      value={q.points}
                      onChange={(e) => updateQuestion(qi, "points", e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* OPTIONS */}
                <Typography fontWeight={600} sx={{ mb: 1 }}>
                  Options
                </Typography>

                {q.options.map((o, oi) => (
                  <Box
                    key={o.id}
                    sx={{
                      display: "flex",
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: o.isCorrect ? "success.main" : "divider",
                      bgcolor: o.isCorrect ? "success.50" : "background.paper",
                      mb: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => updateOption(qi, oi, "isCorrect", true)}
                      sx={{ color: o.isCorrect ? "success.main" : "text.secondary" }}
                    >
                      {o.isCorrect ? <RadioCheckedIcon /> : <RadioIcon />}
                    </IconButton>

                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`Option ${oi + 1}`}
                      value={o.text}
                      onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                    />

                    <IconButton
                      color="error"
                      disabled={q.options.length <= 2}
                      onClick={() => deleteOption(qi, oi)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => addOption(qi)}
                >
                  Add Option
                </Button>

                {/* Delete Question */}
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => deleteQuestion(qi)}
                    disabled={quizData.questions.length <= 1}
                  >
                    Delete Question
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}
