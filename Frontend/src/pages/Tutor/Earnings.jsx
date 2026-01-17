import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  Calendar,
  BookOpen,
  AlertCircle,
  Loader2
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [summary, setSummary] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    monthlyEarnings: 0
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axiosInstance.get("/analytics/tutor/earnings", {
          withCredentials: true,
        });

        console.log("Earnings data:", res.data);

        const earningsList = res.data.earningsList || [];
        const total = res.data.totalEarnings || 0;

        // Calculate stats
        const totalStudents = earningsList.reduce((sum, item) => sum + (item.students || 0), 0);
        const totalCourses = earningsList.length;
        const monthlyEarnings = total * 0.3; // Mock monthly earnings (30% of total)

        setTotalEarnings(total);
        setSummary(earningsList);
        setStats({
          totalStudents,
          totalCourses,
          monthlyEarnings
        });
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const StatCard = ({ icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700"
    };

    const iconColor = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      indigo: "bg-indigo-100 text-indigo-600",
      purple: "bg-purple-100 text-purple-600"
    };

    return (
      <div className={`rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${colorClasses[color]}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconColor[color]}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-3xl font-bold">{value}</h3>
            <h4 className="text-lg font-semibold mt-1">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Earnings Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Track your course revenue and student enrollments
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<Wallet className="w-6 h-6" />}
              title="Total Earnings"
              value={`₹${totalEarnings.toFixed(2)}`}
              subtitle="Lifetime revenue"
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Monthly Revenue"
              value={`₹${stats.monthlyEarnings.toFixed(2)}`}
              subtitle="Current month"
              color="green"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Total Students"
              value={stats.totalStudents.toString()}
              subtitle="Across all courses"
              color="indigo"
            />
          </div>

          {/* Earnings Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                Course Earnings Breakdown
              </h2>
              <p className="text-gray-600 mt-1">
                Detailed revenue analysis per course
              </p>
            </div>

            {summary.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 text-gray-400 mx-auto mb-4">
                  <BookOpen className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No earnings data available
                </h3>
                <p className="text-gray-500">
                  Your earnings will appear here once students enroll in your courses
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">#</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Course Title</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">Students</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">Price</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">Total Earned</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((item, index) => (
                      <tr 
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-700">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">
                            {item.courseTitle}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                            {item.students}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-blue-700">
                            ₹{(item.totalEarnings / (item.students || 1)).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-green-700">
                            ₹{item.totalEarnings.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          {summary.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-xl border border-blue-100">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-gray-600">
                  Showing {summary.length} courses with active enrollments
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-xl font-bold text-blue-700">
                    ₹{totalEarnings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Earnings;