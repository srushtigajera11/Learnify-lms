import {
  Users,
  Mail,
  Calendar,
  BookOpen,
  Download,
  Filter,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const EnrolledStudents = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [groupedEnrollments, setGroupedEnrollments] = useState({});
  const [selectedCourse, setSelectedCourse] = useState("All");

  // Group enrollments by course title
  const groupByCourse = (data) => {
    const grouped = {};
    data.forEach((enroll) => {
      const courseTitle = enroll.courseId?.title || "Untitled Course";
      if (!grouped[courseTitle]) {
        grouped[courseTitle] = [];
      }
      grouped[courseTitle].push(enroll);
    });
    return grouped;
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axiosInstance.get("/analytics/tutor/enrollments", {
          withCredentials: true,
        });
        const data = response.data.enrollments || [];
        setEnrollments(data);
        setGroupedEnrollments(groupByCourse(data));
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const CourseCard = ({ title, enrollments, course }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 hover:shadow-md transition-shadow">
      {/* Course Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
        <div className="flex items-start md:items-center gap-4 md:gap-6">
          {course?.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-20 h-20 rounded-xl object-cover border border-gray-300 shadow-sm flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {course?.title || title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                {enrollments.length} students
              </span>
              {course?.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-300">
                  {course.category}
                </span>
              )}
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">#</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Student</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Contact</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Enrollment Date</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enroll, index) => (
              <tr 
                key={enroll._id}
                className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-700">
                    {index + 1}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      {enroll.studentId?.name ? enroll.studentId.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {enroll.studentId?.name || "Anonymous Student"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {enroll.studentId?.email || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {new Date(enroll.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
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
    </div>
  );

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Student Management
            </h1>
            <p className="text-gray-600">
              Manage and track your enrolled students across all courses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-blue-600">
              {enrollments.length} Total Students
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-700">
                {Object.keys(groupedEnrollments).length}
              </p>
              <p className="text-gray-600 text-sm mt-1">Active Courses</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-100 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-700">
                {enrollments.length}
              </p>
              <p className="text-gray-600 text-sm mt-1">Total Enrollments</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Filter */}
          {Object.keys(groupedEnrollments).length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">
                    Filter by Course
                  </label>
                </div>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 max-w-xs"
                >
                  <option value="All">All Courses</option>
                  {Object.keys(groupedEnrollments).map((title, idx) => (
                    <option key={idx} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-gray-500 md:ml-auto">
                  Showing {selectedCourse === "All" ? "all" : "1"} course(s)
                </div>
              </div>
            </div>
          )}

          {/* Courses List */}
          {Object.entries(groupedEnrollments)
            .filter(([title]) => selectedCourse === "All" || selectedCourse === title)
            .map(([courseTitle, courseEnrollments], idx) => (
              <CourseCard
                key={idx}
                title={courseTitle}
                enrollments={courseEnrollments}
                course={courseEnrollments[0]?.courseId}
              />
            ))}

          {/* Empty State */}
          {Object.keys(groupedEnrollments).length === 0 && !loading && (
            <div className="bg-gradient-to-r from-blue-50/20 to-purple-50/20 rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
              <div className="w-16 h-16 text-gray-300 mx-auto mb-4">
                <BookOpen className="w-full h-full" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No students enrolled yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Students will appear here once they enroll in your courses
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnrolledStudents;