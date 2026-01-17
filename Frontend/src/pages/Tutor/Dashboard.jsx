import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  Loader2,
  AlertCircle,
  FileText,
  Eye
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../../Layout/TutorDashboardCard";
import EarningsChart from "../../Components/EarningsChart";
import CourseCard from "./CourseCard";
import QuickStatsChart from "../../Components/QuickStatsChart";
import RecentReviews from "../../Components/RecentReviews";

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    monthlyEarnings: 0,
    pendingApprovals: 0,
    draftCount: 0,
    publishedCount: 0,
    rejectedCount: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/courses/tutor/courses?status=all");
        if (Array.isArray(res.data)) {
          setCourses(res.data);
          
          const draftCount = res.data.filter(c => c.status === 'draft').length;
          const pendingCount = res.data.filter(c => c.status === 'pending').length;
          const publishedCount = res.data.filter(c => c.status === 'published').length;
          const rejectedCount = res.data.filter(c => c.status === 'rejected').length;
          
          setStats(prev => ({
            ...prev,
            pendingApprovals: pendingCount,
            draftCount,
            publishedCount,
            rejectedCount
          }));
        } else {
          setError("Invalid data format received from server");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          axiosInstance.get("/courses/tutor/stats"),
          axiosInstance.get("/analytics/tutor/stats", {
            withCredentials: true,
          }).catch(() => ({ data: { data: {} } }))
        ]);
        
        setStats(prev => ({
          ...prev,
          ...statsRes.data,
          ...analyticsRes.data.data
        }));
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      draft: { 
        label: 'Draft', 
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
        icon: <Clock className="w-4 h-4" />
      },
      pending: { 
        label: 'Pending Review', 
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
        icon: <Clock className="w-4 h-4" />
      },
      published: { 
        label: 'Published', 
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        icon: <CheckCircle className="w-4 h-4" />
      },
      rejected: { 
        label: 'Rejected', 
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        icon: <AlertTriangle className="w-4 h-4" />
      },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const handleSubmitForReview = async (courseId) => {
    try {
      await axiosInstance.put(`/courses/${courseId}/submit`);
      const res = await axiosInstance.get("/courses/tutor/courses?status=all");
      if (Array.isArray(res.data)) {
        setCourses(res.data);
      }
      alert("Course submitted for admin approval!");
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err.response?.data?.message || "Failed to submit for review");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Tutor Dashboard
        </h1>
        <button
          onClick={() => navigate('/tutor/create-course')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Courses"
          value={stats.totalCourses || courses.length}
          icon={<BookOpen className="w-6 h-6 text-blue-700" />}
          color="bg-blue-50"
        />
        <SummaryCard
          title="Active Students"
          value={stats.totalEnrollments || 0}
          icon={<Users className="w-6 h-6 text-green-700" />}
          color="bg-green-50"
        />
        <SummaryCard
          title="Pending Review"
          value={stats.pendingApprovals || 0}
          icon={<Clock className="w-6 h-6 text-yellow-700" />}
          color="bg-yellow-50"
          subtitle={`${stats.draftCount || 0} drafts ready`}
        />
        <SummaryCard
          title="Monthly Earnings"
          value={`₹${(stats.monthlyEarnings || 0).toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-red-700" />}
          color="bg-red-50"
        />
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Course Status Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300 mb-2 inline-block">
              Draft
            </span>
            <p className="text-2xl font-bold">{stats.draftCount || 0}</p>
          </div>
          <div className="text-center">
            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-full border border-yellow-300 mb-2 inline-block">
              Pending
            </span>
            <p className="text-2xl font-bold">{stats.pendingApprovals || 0}</p>
          </div>
          <div className="text-center">
            <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-300 mb-2 inline-block">
              Published
            </span>
            <p className="text-2xl font-bold">{stats.publishedCount || 0}</p>
          </div>
          <div className="text-center">
            <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-300 mb-2 inline-block">
              Rejected
            </span>
            <p className="text-2xl font-bold">{stats.rejectedCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Earnings Overview
            </h2>
            <EarningsChart />
          </div>
        </div>
        <div className="space-y-6">
          <QuickStatsChart />
          <RecentReviews />
        </div>
      </div>

      {/* My Courses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/tutor/courses')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              View All
            </button>
            <button
              onClick={() => navigate('/tutor/create-course')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              New Course
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No courses available at the moment.</p>
            <button
              onClick={() => navigate('/tutor/create-course')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Send className="w-4 h-4" />
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => (
              <div key={course._id}>
                <CourseCard
                  course={{
                    id: course._id,
                    title: course.title,
                    imageUrl: course.thumbnail || "https://via.placeholder.com/400x200",
                    status: course.status || "draft",
                    price: course.price || 0,
                    description: course.description,
                    category: course.category,
                    adminFeedback: course.adminFeedback,
                  }}
                  showStatus={true}
                  getStatusChip={getStatusChip}
                  onEdit={() => navigate(`/tutor/courses/edit/${course._id}`)}
                  onSubmitReview={() => handleSubmitForReview(course._id)}
                  showSubmitButton={course.status === 'draft' || course.status === 'rejected'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/tutor/courses')}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View All Courses
          </button>
          <button
            onClick={() => navigate('/tutor/courses?filter=pending')}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Pending Reviews
          </button>
          <button
            onClick={() => navigate('/tutor/courses?filter=published')}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Published Courses
          </button>
          <button
            onClick={() => navigate('/tutor/courses?filter=rejected')}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Rejected Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;