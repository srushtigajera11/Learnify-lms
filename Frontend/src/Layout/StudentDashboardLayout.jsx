import { Outlet } from "react-router-dom";
import StudentNavbar from "../Components/StudentNavbar";
import Footer from "../Components/Footer";
import WelcomeBanner from "../Components/WelcomeBanner";
import { useAuth } from "../Context/AuthContext";

const StudentDashboardLayout = () => {
  const { loading } = useAuth();

  if (loading) return null; // or spinner

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeBanner />
      <StudentNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboardLayout;
