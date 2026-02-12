import axiosInstance from "../../../utils/axiosInstance";

export const fetchCourseData = async (courseId) => {
  try {
    const [courseRes, lessonsRes] = await Promise.all([
      axiosInstance.get(`/students/course-details/${courseId}`),
      axiosInstance.get(`/students/courses/${courseId}/lessons`)
    ]);

    if (!courseRes.data.success) {
      throw new Error("Failed to load course");
    }

    if (!lessonsRes.data.success) {
      throw new Error("Failed to load lessons");
    }

    return {
      course: courseRes.data.course,
      lessons: lessonsRes.data.lessons
    };

  } catch (error) {
    console.error("Error fetching course data:", error.response?.data || error.message);
    throw error;
  }
};


export const markLessonComplete = async (courseId, lessonId) => {
  try {
    const res = await axiosInstance.post(
      `/students/courses/${courseId}/lessons/${lessonId}/complete`
    );

    if (!res.data.success) {
      throw new Error("Failed to mark lesson complete");
    }

    return res.data.progress;

  } catch (error) {
    console.error("Error marking lesson complete:", error.response?.data || error.message);
    throw error;
  }
};
