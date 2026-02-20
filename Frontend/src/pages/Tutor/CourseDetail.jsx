import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const statusStyles = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const [stats, setStats] = useState({
  totalLessons: 0,
  totalDuration: 0,
  totalSections: 0,
  totalQuizzes: 0,
  completeness: 0,
  totalStudents: 0,
});

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/courses/my-course/${courseId}`);
        setCourse(res.data);

        try {
          const statsRes = await axiosInstance.get(`/courses/${courseId}/stats`);
          setStats(statsRes.data.stats);

        } catch (err) {
          console.error('Error fetching course stats:', err);
        }
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const completeness = () => {
    if (!course) return 0;
    const checks = [
      course?.title?.length >= 10,
      course?.description?.length >= 50,
      course?.category,
      course?.thumbnail,
      stats.totalLessons > 0,
      course?.price !== undefined,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const submitCourse = async () => {
    if (!confirm('Submit this course for review?')) return;
    try {
      await axiosInstance.put(`/courses/${courseId}/submit`);
      alert('Submitted for review');
      window.location.reload();
    } catch {
      alert('Submission failed');
    }
  };

  const saveNotes = async () => {
    if (!notes.trim()) return;
    await axiosInstance.put(`/courses/${courseId}/feedback`, { feedback: notes });
    alert('Notes saved');
    setShowNotes(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
        <button
          onClick={() => navigate('/tutor/courses')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Courses
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/tutor/courses')}
        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
      >
        ← Back to Courses
      </button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 text-sm md:text-base">{course.description}</p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-full">
              {course.category}
            </span>
            <span className="px-3 py-1 text-xs md:text-sm bg-blue-100 text-blue-700 rounded-full">
              ${course.price}
            </span>
            <span className={`px-3 py-1 text-xs md:text-sm rounded-full font-medium ${statusStyles[course.status]}`}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </span>
          </div>
        </div>

       <div className="flex items-start gap-3">
  <button
    onClick={() => navigate(`/tutor/course/${courseId}/edit`)}
    className="h-14 w-28 text-sm font-medium  bg-blue-700 text-white border hover:bg-blue-600 transition-colors"
  >
    Edit Course
  </button>

  {course.status === 'draft' && (
    <button
      onClick={submitCourse}
      disabled={stats.completeness < 70}
      className="h-11 px-6 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Submit for Review
    </button>
  )}
</div>

      </div>

      {/* Progress Section */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-gray-700">Course Completion</span>
          <span className="font-semibold text-blue-600">{stats.completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.completeness}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard label="Lessons" value={stats.totalLessons} />
          <StatCard label="Duration" value={`${Math.round(stats.totalDuration / 60)}h`} />
          <StatCard label="Sections" value={stats.totalSections} />
          <StatCard label="Students" value={course.studentCount || 0} />
        </div>
      </div> */}

      {/* Management Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ManageCard
            title="Lessons"
            count={stats.totalLessons}
            onView={() => navigate(`/tutor/course/${courseId}/lessons`)}
            onAdd={() => navigate(`/tutor/course/${courseId}/lessons/add`)}
          />
          <ManageCard
            title="Quizzes"
            count={stats.totalQuizzes}
            onView={() => navigate(`/tutor/course/${courseId}/quizzes`)}
            onAdd={() => navigate(`/tutor/course/${courseId}/quizzes/create`)}
          />
          <ManageCard className="col-span-1 md:col-span-1 text-center"
            title="Students"
            count={stats.totalStudents || 0}
            onView={() => navigate(`/tutor/students`)}
          />
        </div>
      </div>

      {/* Quick Tools */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ToolButton label="Preview Course"onClick={() => alert('Preview feature coming soon!')}/>
          <ToolButton label="Analytics" onClick={() => navigate(`/tutor/course/${courseId}/analytics`)} />
          <ToolButton label="Export" onClick={() => alert('Export feature coming soon!')} />
          <ToolButton label="Internal Notes" onClick={() => setShowNotes(true)} />
        </div>
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Internal Notes</h3>
              <button
                onClick={() => setShowNotes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Add your private notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowNotes(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small Components ---------- */
const StatCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

const ManageCard = ({ title, count, onView, onAdd }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <span className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
        {count}
      </span>
    </div>
    <div className="space-y-3">
      <button
        onClick={onView}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        View {title}
      </button>
      {onAdd && (
        <button
          onClick={onAdd}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + Add New
        </button>
      )}
    </div>
  </div>
);

const ToolButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
  >
    {label}
  </button>
);