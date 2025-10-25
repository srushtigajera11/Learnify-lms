import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StudentDashboardLayout from "./Layout/StudentDashboardLayout";
import TutorDashboardLayout from "./Layout/TutorDashboardLayout";
import TutorDashboard from "./pages/Tutor/Dashboard";
import MyCourses from "./pages/Tutor/MyCourses";
import CreateCourse from "./pages/Tutor/CreateCourse";
import EnrolledStudents from "./pages/Tutor/EnrolledStudents";
import Earnings from "./pages/Tutor/Earnings";
import AddLessonForm from "./pages/Tutor/AddLessonForm";
import CourseDetailTutor from "./pages/Tutor/CourseDetail";
import ViewLessons from "./pages/Tutor/ViewLessons";
import EditLesson from "./pages/Tutor/EditLesson";
import TutorProfileWrapper from "./Components/TutorProfileWrapper";
import EditCourse from "./pages/Tutor/EditCourse";

import Dashboard from "./pages/Student/Dashboard";
import EnrolledCourses from "./pages/Student/EnrolledCourses";
import WishList from "./pages/Student/WishList";
import Reviews from "./pages/Student/Reviews";
import PurchaseHistory from "./pages/Student/PurchaseHistory";
import Profile from "./pages/Student/Profile";
import CourseDetailStudent from "./pages/Student/CourseDetail";

import { useAuth } from "./Context/authContext";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Student Routes */}
      <Route path="/student" element={<StudentDashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mylearning" element={<EnrolledCourses />} />
        <Route path="wishlist" element={<WishList />} />
        <Route path="review" element={<Reviews />} />
        <Route path="purchaseHistory" element={<PurchaseHistory />} />
        <Route path="profile" element={<Profile />} />
        <Route path="course/:courseId" element={<CourseDetailStudent />} />
        <Route path="*" element={<Dashboard />} />
      </Route>

      {/* Tutor Routes */}
      <Route path="/tutor" element={<TutorDashboardLayout />}>
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="profile" element={<TutorProfileWrapper />} />
        <Route path="students" element={<EnrolledStudents />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="course/:courseId" element={<CourseDetailTutor />} />
        <Route path="course/:courseId/edit" element={<EditCourse />} />
        <Route path="course/:courseId/lessons/add" element={<AddLessonForm />} />
        <Route path="course/:courseId/lessons" element={<ViewLessons />} />
        <Route
          path="course/:courseId/lesson/:lessonId/edit"
          element={<EditLesson />}
        />
      </Route>

      {/* Admin Route Protected */}
      <Route
        path="/admin/dashboard"
        element={
          user?.isAdmin ? <AdminDashboard /> : <Navigate to="/unauthorized" />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
