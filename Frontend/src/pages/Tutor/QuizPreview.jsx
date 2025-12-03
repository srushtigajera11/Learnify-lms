// QuizPreview.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
} from "@mui/material";
import { ArrowBack, Timer, Assignment, CheckCircle } from "@mui/icons-material";
import axiosInstance from "../../utils/axiosInstance";

export default function QuizPreview() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuiz();
    // cleanup timer on unmount
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (!timeLeft || isSubmitted) return;
    timerRef.current = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, isSubmitted]);

  useEffect(() => {
    if (timeLeft === 0 && quiz && !isSubmitted) {
      // auto-submit when timer hits 0
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
      const data = res.data.data;
      setQuiz(data);
      if (data.timeLimit) setTimeLeft(data.timeLimit * 60);
    } catch (err) {
      console.error("Load quiz error:", err);
      setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const formatTime = (seconds) => {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const calculateResults = () => {
    if (!quiz) return null;
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctAnswers = 0;
    const detailed = quiz.questions.map((q) => {
      totalPoints += q.points;
      const selected = answers[q._id];
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = selected && correctOption && selected === correctOption._id;
      if (isCorrect) {
        correctAnswers += 1;
        earnedPoints += q.points;
      }
      return {
        question: q.questionText,
        userAnswer: selected ? (q.options.find((o) => o._id === selected)?.text ?? "Unknown") : "Not answered",
        correctAnswer: correctOption ? correctOption.text : "N/A",
        isCorrect,
        points: q.points,
        pointsEarned: isCorrect ? q.points : 0,
      };
    });
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= (quiz.passingScore ?? 0);
    return { score, passed, correctAnswers, totalQuestions: quiz.questions.length, totalPoints, earnedPoints, detailedResults: detailed };
  };

  const handleSubmit = () => {
    const res = calculateResults();
    setResults(res);
    setIsSubmitted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setResults(null);
    if (quiz?.timeLimit) setTimeLeft(quiz.timeLimit * 60);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading quiz preview...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!quiz) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Quiz not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}>
          Back to quizzes
        </Button>
        <Chip label="PREVIEW MODE" color="info" variant="outlined" sx={{ fontWeight: 700 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom fontWeight={700}>
                {quiz.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {quiz.description || "No description provided."}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Assignment color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Questions</Typography>
                      <Typography variant="h6">{quiz.questions.length}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Timer color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Time</Typography>
                      <Typography variant="h6">{quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Passing</Typography>
                      <Typography variant="h6">{quiz.passingScore}%</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Max attempts</Typography>
                    <Typography variant="h6">{quiz.maxAttempts}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {quiz.timeLimit && !isSubmitted && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">Timer</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                    <Typography variant="h5" color="primary" sx={{ minWidth: 80 }}>{formatTime(timeLeft)}</Typography>
                    <LinearProgress variant="determinate" value={(timeLeft / (quiz.timeLimit * 60)) * 100} sx={{ flex: 1 }} />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Results (if submitted) */}
          {isSubmitted && results && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary">Preview Results</Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color={results.passed ? "success.main" : "error.main"}>{results.score.toFixed(1)}%</Typography>
                      <Typography variant="caption" color="text.secondary">Score</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4">{results.correctAnswers}/{results.totalQuestions}</Typography>
                      <Typography variant="caption" color="text.secondary">Correct</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h5">{results.earnedPoints}/{results.totalPoints}</Typography>
                      <Typography variant="caption" color="text.secondary">Points</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                      <Chip label={results.passed ? "PASSED" : "FAILED"} color={results.passed ? "success" : "error"} sx={{ fontWeight: 700, py: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Status</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Detailed</Typography>
                <List>
                  {results.detailedResults.map((r, idx) => (
                    <ListItem key={idx} sx={{ mb: 1, borderRadius: 1, border: "1px solid", borderColor: r.isCorrect ? "success.light" : "error.light", bgcolor: r.isCorrect ? "success.50" : "error.50" }}>
                      <ListItemText
                        primary={<Typography fontWeight={600}>{`Q${idx + 1}: ${r.question}`}</Typography>}
                        secondary={
                          <>
                            <Typography variant="body2">Your: {r.userAnswer}</Typography>
                            <Typography variant="body2">Correct: {r.correctAnswer}</Typography>
                            <Typography variant="body2" color={r.isCorrect ? "success.main" : "error.main"}>{r.isCorrect ? `✓ +${r.pointsEarned}` : "✗ 0"}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
                  <Button variant="outlined" onClick={handleReset}>Try again</Button>
                  <Button variant="contained" onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quizId}/edit`)}>Edit quiz</Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Questions list (if not submitted) */}
          {!isSubmitted && (
            <>
              {quiz.questions.map((q, idx) => (
                <Card key={q._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {`Q${idx + 1}`} <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>{`${q.points} pt`}</Typography>
                      </Typography>
                      <Chip label={q.questionType === "multiple-choice" ? "Multiple choice" : "True/False"} size="small" color="secondary" />
                    </Box>

                    <Typography variant="body1" sx={{ mb: 1 }}>{q.questionText}</Typography>

                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup value={answers[q._id] ?? ""} onChange={(e) => handleChoose(q._id, e.target.value)}>
                        {q.options.map((opt) => (
                          <FormControlLabel
                            key={opt._id}
                            value={opt._id}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <span>{opt.text}</span>
                                {/* Keep "correct" chips hidden (preview mode shows them only optionally) - here we show only in very clear preview mode */}
                              </Box>
                            }
                            sx={{ mb: 1, p: 1, borderRadius: 1, border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>
              ))}

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Answered: {Object.keys(answers).length} / {quiz.questions.length}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={handleReset}>Reset</Button>
                      <Button variant="contained" onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.questions.length}>Submit</Button>
                    </Stack>
                  </Box>

                  {Object.keys(answers).length !== quiz.questions.length && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Please answer all questions to see results. You have answered {Object.keys(answers).length}.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Grid>

        {/* Right - sticky question index */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: { md: "sticky" }, top: 24 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Quiz at a glance</Typography>
              <Typography variant="body2" color="text.secondary">Total questions: {quiz.questions.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total points: {quiz.questions.reduce((s, q) => s + q.points, 0)}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Jump to question</Typography>
              <List dense>
                {quiz.questions.map((q, i) => (
                  <ListItem key={q._id} button onClick={() => {
                    const el = document.querySelectorAll(".MuiCard-root")[i + 1]; // rough jump: header card is first; question cards follow
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}>
                    <ListItemText primary={`Q${i + 1}`} secondary={`${q.points} pt`} />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>Quick actions</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                <Button variant="outlined" size="small" onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quizId}/edit`)}>Edit quiz</Button>
                <Button variant="contained" size="small" onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}>Back to list</Button>
              </Stack>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
