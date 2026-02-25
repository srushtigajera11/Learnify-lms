import axiosInstance from "../../../utils/axiosInstance";

export const fetchCourseContent = async (courseId) => {
  const res = await axiosInstance.get(
    `/students/course/${courseId}/content`
  );
  return res.data;
};

export const fetchLesson = async (courseId, lessonId) => {
  const res = await axiosInstance.get(
    `/students/course/${courseId}/lesson/${lessonId}`
  );
  return res.data.lesson;
};

export const fetchQuiz = async (courseId, quizId) => {
  const res = await axiosInstance.get(
    `/students/course/${courseId}/quiz/${quizId}`
  );
  return res.data.quiz;
};

export const submitQuiz = async (courseId, quizId, answers) => {
  const res = await axiosInstance.post(
    `/students/course/${courseId}/quiz/${quizId}/submit`,
    { answers }
  );
  return res.data.result;
};

export const markLessonComplete = async (courseId, lessonId) => {
  await axiosInstance.post(
    `/students/course/${courseId}/lesson/${lessonId}/complete`
  );
};

