import axiosInstance from "../../../utils/axiosInstance";

// ── Course content (lessons + quizzes + certificate slot) ─────────────────────
export const fetchCourseContent = async (courseId) => {
  const res = await axiosInstance.get(`/students/course/${courseId}/content`);
  return res.data;
};

// ── Individual lesson ─────────────────────────────────────────────────────────
export const fetchLesson = async (courseId, lessonId) => {
  const res = await axiosInstance.get(`/students/course/${courseId}/lesson/${lessonId}`);
  return res.data.lesson;
};

// ── Individual quiz ───────────────────────────────────────────────────────────
export const fetchQuiz = async (courseId, quizId) => {
  const res = await axiosInstance.get(`/students/course/${courseId}/quiz/${quizId}`);
  return res.data.quiz;
};

// ── Mark lesson complete ──────────────────────────────────────────────────────
export const markLessonComplete = async (courseId, lessonId) => {
  const res = await axiosInstance.post(
    `/students/course/${courseId}/lesson/${lessonId}/complete`
  );
  return res.data;
};

// ── Submit quiz ───────────────────────────────────────────────────────────────
// answers: { [questionId]: selectedOptionId }  (object map from QuizTaker)
export const submitQuiz = async (courseId, quizId, answers) => {
  const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
    questionId,
    selectedOption,
  }));

  // axiosInstance baseURL already includes /api (e.g. http://localhost:5000/api)
  // so we omit /api here — final URL: http://localhost:5000/api/quiz-results/quiz/:id/attempt
  const res = await axiosInstance.post(
    `/quiz-results/quiz/${quizId}/attempt`,
    { answers: answersArray, timeSpent: 0 }
  );

  return res.data.result;
};

// ── Full progress for a course ────────────────────────────────────────────────
export const fetchCourseProgress = async (courseId) => {
  const res = await axiosInstance.get(`/students/course/${courseId}/progress`);
  return res.data.progress;
};

// ── All courses progress summary ──────────────────────────────────────────────
export const fetchAllProgress = async () => {
  const res = await axiosInstance.get(`/students/progress/all`);
  return res.data;
};