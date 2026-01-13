import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalLessons: 0, totalDuration: 0 });
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/courses/my-course/${courseId}`);
        setCourse(res.data);

        try {
          const statsRes = await axiosInstance.get(`/courses/${courseId}/stats`);
          setStats(statsRes.data.stats || { totalLessons: 0, totalDuration: 0 });
        } catch {}
      } catch {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const completeness = () => {
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
    await axiosInstance.put(`/courses/${courseId}/submit`);
    alert('Submitted for review');
    window.location.reload();
  };

  const saveNotes = async () => {
    await axiosInstance.put(`/courses/${courseId}/feedback`, { feedback: notes });
    alert('Notes saved');
    setShowNotes(false);
  };

  if (loading)
    return <div className="flex justify-center items-center h-96">Loading...</div>;

  if (error)
    return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/tutor/courses')}
        className="text-blue-600 hover:underline"
      >
        ← Back to Courses
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-3 py-1 text-sm border rounded">
              {course.category}
            </span>
            <span className="px-3 py-1 text-sm border rounded">
              ${course.price}
            </span>
            <span
              className={`px-3 py-1 text-sm rounded text-white ${
                course.status === 'published'
                  ? 'bg-green-600'
                  : course.status === 'pending'
                  ? 'bg-yellow-500'
                  : course.status === 'rejected'
                  ? 'bg-red-600'
                  : 'bg-gray-500'
              }`}
            >
              {course.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/tutor/course/${courseId}/edit`)}
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            Edit
          </button>

          {course.status === 'draft' && (
            <button
              onClick={submitCourse}
              disabled={completeness() < 70}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Submit for Review
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded shadow p-4">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Course Completion</span>
          <span className="font-semibold">{completeness()}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-600 h-2 rounded"
            style={{ width: `${completeness()}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
          <Stat label="Lessons" value={stats.totalLessons} />
          <Stat label="Duration" value={`${Math.round(stats.totalDuration / 60)}h`} />
          <Stat label="Sections" value={course.sections?.length || 0} />
          <Stat label="Students" value={course.studentCount || 0} />
        </div>
      </div>

      {/* Management */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Course Management</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <ManageCard
            title="Lessons"
            count={stats.totalLessons}
            onView={() => navigate(`/tutor/course/${courseId}/lessons`)}
            onAdd={() => navigate(`/tutor/course/${courseId}/lessons/add`)}
          />
          <ManageCard
            title="Quizzes"
            count={course.quizCount || 0}
            onView={() => navigate(`/tutor/course/${courseId}/quizzes`)}
            onAdd={() => navigate(`/tutor/course/${courseId}/quizzes/create`)}
          />
          <ManageCard
            title="Students"
            count={course.studentCount || 0}
            onView={() => navigate(`/tutor/course/${courseId}/students`)}
          />
        </div>
      </div>

      {/* Tools */}
      <div className="bg-white rounded shadow p-4 grid md:grid-cols-4 gap-4">
        <Tool label="Preview Course" onClick={() => window.open(`/course/preview/${courseId}`)} />
        <Tool label="Analytics" onClick={() => navigate(`/tutor/course/${courseId}/analytics`)} />
        <Tool label="Export" onClick={() => alert('Coming soon')} />
        <Tool label="Internal Notes" onClick={() => setShowNotes(true)} />
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="font-semibold mb-3">Internal Notes</h3>
            <textarea
              className="w-full border rounded p-2"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowNotes(false)}>Cancel</button>
              <button onClick={saveNotes} className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small Components ---------- */

const Stat = ({ label, value }) => (
  <div>
    <p className="text-xl font-bold">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const ManageCard = ({ title, count, onView, onAdd }) => (
  <div className="bg-white border rounded p-4 hover:shadow transition">
    <div className="flex justify-between mb-2">
      <h3 className="font-semibold">{title}</h3>
      <span className="text-sm bg-gray-100 px-2 rounded">{count}</span>
    </div>
    <div className="space-y-2">
      <button onClick={onView} className="w-full border rounded py-2">
        View {title}
      </button>
      {onAdd && (
        <button onClick={onAdd} className="w-full bg-blue-600 text-white rounded py-2">
          Add {title.slice(0, -1)}
        </button>
      )}
    </div>
  </div>
);

const Tool = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="border rounded py-3 hover:bg-gray-50 font-medium"
  >
    {label}
  </button>
);
