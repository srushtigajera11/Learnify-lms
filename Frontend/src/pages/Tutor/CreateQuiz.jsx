// CreateEditQuiz.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
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
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Stack,
  Alert,
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
import axiosInstance from "../../utils/axiosInstance";

export default function CreateEditQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(quizId);

  const [loading, setLoading] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState("");
  const [openQuestion, setOpenQuestion] = useState(0); // which accordion open

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 1,
    shuffleQuestions: false,
    isPublished: false,
    questions: [
      {
        id: Date.now().toString(),
        questionText: "",
        questionType: "multiple-choice",
        options: [
          { id: "o1", text: "", isCorrect: true },
          { id: "o2", text: "", isCorrect: false },
        ],
        points: 1,
      },
    ],
  });

  useEffect(() => {
    // if editing, fetch the quiz
    if (!isEditing) return;
    const fetchQuiz = async () => {
      try {
        setLoadingQuiz(true);
        const res = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
        const data = res.data.data;
        // map to local shape (ensure option ids exist)
        const mapped = {
          title: data.title || "",
          description: data.description || "",
          timeLimit: data.timeLimit ?? 30,
          passingScore: data.passingScore ?? 70,
          maxAttempts: data.maxAttempts ?? 1,
          shuffleQuestions: data.shuffleQuestions ?? false,
          isPublished: data.isPublished ?? false,
          questions: (data.questions || []).map((q) => ({
            id: q._id || Date.now().toString(),
            questionText: q.questionText || "",
            questionType: q.questionType || "multiple-choice",
            points: q.points ?? 1,
            options: (q.options || []).map((opt, idx) => ({
              id: opt._id || `opt-${idx}-${Date.now()}`,
              text: opt.text || "",
              isCorrect: !!opt.isCorrect,
            })),
          })),
        };
        // ensure each question has at least two options
        if (mapped.questions.length === 0) {
          mapped.questions = [
            {
              id: Date.now().toString(),
              questionText: "",
              questionType: "multiple-choice",
              options: [
                { id: "o1", text: "", isCorrect: true },
                { id: "o2", text: "", isCorrect: false },
              ],
              points: 1,
            },
          ];
        }
        setQuizData(mapped);
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setError(err.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [isEditing, quizId]);

  const addQuestion = () => {
    const q = {
      id: Date.now().toString(),
      questionText: "",
      questionType: "multiple-choice",
      options: [
        { id: `${Date.now()}-o1`, text: "", isCorrect: true },
        { id: `${Date.now()}-o2`, text: "", isCorrect: false },
      ],
      points: 1,
    };
    setQuizData((prev) => ({ ...prev, questions: [...prev.questions, q] }));
    setOpenQuestion(quizData.questions.length);
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length <= 1) {
      setError("Quiz must have at least one question.");
      return;
    }
    const copy = [...quizData.questions];
    copy.splice(index, 1);
    setQuizData({ ...quizData, questions: copy });
    setError("");
    setOpenQuestion(Math.max(0, index - 1));
  };

  const updateQuestionField = (index, field, value) => {
    const copy = [...quizData.questions];
    copy[index] = { ...copy[index], [field]: value };
    setQuizData({ ...quizData, questions: copy });
  };

  const addOption = (qIndex) => {
    const copy = [...quizData.questions];
    const newOpt = { id: `${Date.now()}-opt-${copy[qIndex].options.length}`, text: "", isCorrect: false };
    copy[qIndex].options.push(newOpt);
    setQuizData({ ...quizData, questions: copy });
  };

  const removeOption = (qIndex, optIndex) => {
    const copy = [...quizData.questions];
    if (copy[qIndex].options.length <= 2) {
      setError("Each question needs at least 2 options.");
      return;
    }
    copy[qIndex].options.splice(optIndex, 1);
    // ensure at least one correct
    if (!copy[qIndex].options.some((o) => o.isCorrect)) {
      copy[qIndex].options[0].isCorrect = true;
    }
    setQuizData({ ...quizData, questions: copy });
    setError("");
  };

  const updateOption = (qIndex, optIndex, field, value) => {
    const copy = [...quizData.questions];
    const opts = copy[qIndex].options.map((opt, idx) => ({ ...opt }));
    if (field === "isCorrect") {
      // single-correct enforced (radio behavior)
      opts.forEach((o, i) => (o.isCorrect = i === optIndex ? value : false));
    } else {
      opts[optIndex][field] = value;
    }
    copy[qIndex].options = opts;
    setQuizData({ ...quizData, questions: copy });
  };

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      setError("Quiz title is required.");
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: text is required.`);
        return false;
      }
      const validOptions = q.options.filter((o) => o.text.trim() !== "");
      if (validOptions.length < 2) {
        setError(`Question ${i + 1}: at least 2 options required.`);
        return false;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        setError(`Question ${i + 1}: mark one correct answer.`);
        return false;
      }
      if (q.options.filter((o) => o.isCorrect).length > 1) {
        setError(`Question ${i + 1}: only one correct answer allowed.`);
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateQuiz()) return;
    setLoading(true);
    try {
      const payload = {
        title: quizData.title,
        description: quizData.description,
        timeLimit: Number(quizData.timeLimit) || 0,
        passingScore: Number(quizData.passingScore) || 0,
        maxAttempts: Number(quizData.maxAttempts) || 1,
        shuffleQuestions: !!quizData.shuffleQuestions,
        isPublished: !!quizData.isPublished,
        questions: quizData.questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: Number(q.points) || 1,
          options: q.options.map((o) => ({ text: o.text, isCorrect: !!o.isCorrect })),
        })),
      };

      if (isEditing) {
        await axiosInstance.put(`/quizzes/quiz/${quizId}`, payload);
      } else {
        await axiosInstance.post(`/quizzes/${courseId}`, payload);
      }
      navigate(`/tutor/course/${courseId}/quizzes`);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = quizData.questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Build assessments to test learners. Clean UI inspired by top platforms.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<CancelIcon />}
            onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSave}
            variant="contained"
            disabled={loading || loadingQuiz}
          >
            {loading ? "Saving..." : "Save Quiz"}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left column - settings & summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Quiz Settings
              </Typography>

              <TextField
                label="Quiz Title"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              />

              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
              />

              <Grid container spacing={1}>
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
                    label="Pass %"
                    type="number"
                    fullWidth
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} sx={{ mt: 1 }}>
                  <TextField
                    label="Max Attempts"
                    type="number"
                    fullWidth
                    value={quizData.maxAttempts}
                    onChange={(e) => setQuizData({ ...quizData, maxAttempts: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={quizData.shuffleQuestions}
                        onChange={(e) => setQuizData({ ...quizData, shuffleQuestions: e.target.checked })}
                      />
                    }
                    label="Shuffle"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={quizData.isPublished}
                    onChange={(e) => setQuizData({ ...quizData, isPublished: e.target.checked })}
                  />
                }
                label="Publish quiz"
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary">
                Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                <Chip label={`Questions: ${quizData.questions.length}`} size="small" />
                <Chip label={`Total points: ${totalPoints}`} size="small" />
                <Chip label={quizData.isPublished ? "Published" : "Draft"} size="small" color={quizData.isPublished ? "success" : "default"} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Validation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Quick checks before saving
              </Typography>

              {quizData.questions.map((q, i) => {
                const validOptions = q.options.filter((o) => o.text.trim() !== "");
                const hasCorrect = q.options.some((o) => o.isCorrect);
                const ok = validOptions.length >= 2 && hasCorrect && q.questionText.trim();
                return (
                  <Box key={q.id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Chip label={`Q${i + 1}`} size="small" color={ok ? "success" : "default"} />
                    <Typography variant="body2" color={ok ? "success.main" : "text.secondary"}>
                      {ok ? "OK" : "Needs attention"}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column - questions builder */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              Questions
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<AddIcon />} variant="contained" onClick={addQuestion}>
                Add Question
              </Button>
            </Stack>
          </Box>

          {/* Questions (Accordion per question) */}
          {quizData.questions.map((question, qIndex) => (
            <Accordion
              key={question.id}
              expanded={openQuestion === qIndex}
              onChange={() => setOpenQuestion(openQuestion === qIndex ? -1 : qIndex)}
              sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {`Q${qIndex + 1}. ${question.questionText ? question.questionText.slice(0, 60) : "New question"}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {question.questionType} • {question.options.length} options • {question.points} pt
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Delete question">
                      <IconButton color="error" onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box>
                  <TextField
                    label={`Question ${qIndex + 1} text`}
                    fullWidth
                    multiline
                    rows={2}
                    value={question.questionText}
                    onChange={(e) => updateQuestionField(qIndex, "questionText", e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={question.questionType}
                          label="Type"
                          onChange={(e) => updateQuestionField(qIndex, "questionType", e.target.value)}
                        >
                          <MenuItem value="multiple-choice">Multiple choice</MenuItem>
                          <MenuItem value="true-false">True / False</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="number"
                        label="Points"
                        fullWidth
                        value={question.points}
                        onChange={(e) => updateQuestionField(qIndex, "points", Number(e.target.value) || 1)}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Options
                  </Typography>

                  <Stack spacing={1}>
                    {question.options.map((opt, optIndex) => (
                      <Box
                        key={opt.id}
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          p: 1,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: opt.isCorrect ? "success.light" : "divider",
                          bgcolor: opt.isCorrect ? "success.50" : "background.paper",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => updateOption(qIndex, optIndex, "isCorrect", true)}
                          sx={{ color: opt.isCorrect ? "success.main" : "text.secondary" }}
                        >
                          {opt.isCorrect ? <RadioCheckedIcon /> : <RadioIcon />}
                        </IconButton>

                        <TextField
                          placeholder={`Option ${optIndex + 1}`}
                          fullWidth
                          size="small"
                          value={opt.text}
                          onChange={(e) => updateOption(qIndex, optIndex, "text", e.target.value)}
                          error={opt.isCorrect && !opt.text.trim()}
                          helperText={opt.isCorrect && !opt.text.trim() ? "Correct answer cannot be empty" : ""}
                        />

                        <Tooltip title="Remove option">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeOption(qIndex, optIndex)}
                              disabled={question.options.length <= 2}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    ))}
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button startIcon={<AddIcon />} onClick={() => addOption(qIndex)} variant="outlined" disabled={question.options.length >= 8}>
                      Add option ({question.options.length}/8)
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          {quizData.questions.length === 0 && (
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">No questions yet</Typography>
              <Button sx={{ mt: 2 }} variant="contained" startIcon={<AddIcon />} onClick={addQuestion}>Add first question</Button>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
