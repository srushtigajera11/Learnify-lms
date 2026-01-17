import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  FileText,
  CheckSquare,
  BarChart3,
  Users,
  Upload,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

export default function ViewQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, quiz: null });
  const [publishLoading, setPublishLoading] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/quizzes/${courseId}`);
      console.log('Quizzes response:', response);
      setQuizzes(response.data.data);
    } catch (err) {
      console.error('Load quizzes error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await axiosInstance.delete(`/quizzes/quiz/${quizId}`);
      setDeleteDialog({ open: false, quiz: null });
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handlePublishToggle = async (quiz) => {
    setPublishLoading(quiz._id);
    try {
      await axiosInstance.patch(`/quizzes/quiz/${quiz._id}/publish`);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz status');
    } finally {
      setPublishLoading(null);
    }
  };

  const getTotalPoints = (quiz) => {
    return quiz.questions.reduce((total, question) => total + question.points, 0);
  };

  const getQuestionTypeCount = (quiz) => {
    const counts = { 'multiple-choice': 0, 'true-false': 0 };
    quiz.questions.forEach(q => {
      counts[q.questionType] = (counts[q.questionType] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Course Quizzes</h1>
          <p className="text-gray-600 mt-1">Manage and review all quizzes for this course</p>
        </div>
        <button
          onClick={() => navigate(`/tutor/course/${courseId}/quizzes/create`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{quizzes.length}</p>
          <p className="text-sm text-gray-600">Total Quizzes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <CheckSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">
            {quizzes.filter(q => q.isPublished).length}
          </p>
          <p className="text-sm text-gray-600">Published</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <BarChart3 className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-700">
            {quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Questions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-indigo-700">
            {quizzes.reduce((total, quiz) => total + getTotalPoints(quiz), 0)}
          </p>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6">
          {quizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Quiz Title</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Questions</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Points</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Duration</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Passing Score</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Last Updated</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => {
                    const questionCounts = getQuestionTypeCount(quiz);
                    return (
                      <tr key={quiz._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{quiz.title}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {quiz.description || 'No description'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-gray-700">{quiz.questions.length} questions</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {questionCounts['multiple-choice'] > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  {questionCounts['multiple-choice']} MC
                                </span>
                              )}
                              {questionCounts['true-false'] > 0 && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                  {questionCounts['true-false']} TF
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 border border-blue-500 text-blue-700 text-sm rounded-full">
                            {getTotalPoints(quiz)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-700">
                            {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            quiz.passingScore > 70 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {quiz.passingScore}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={quiz.isPublished}
                                onChange={() => handlePublishToggle(quiz)}
                                disabled={publishLoading === quiz._id}
                                className="sr-only"
                              />
                              <div className={`w-10 h-6 rounded-full transition ${
                                quiz.isPublished ? 'bg-green-600' : 'bg-gray-300'
                              }`}></div>
                              <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform bg-white ${
                                quiz.isPublished ? 'transform translate-x-4' : ''
                              }`}></div>
                            </div>
                            <div className="ml-2 flex items-center gap-1">
                              {quiz.isPublished ? (
                                <Upload className="w-4 h-4 text-green-600" />
                              ) : (
                                <Download className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-700">
                                {quiz.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </label>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-700">
                              {new Date(quiz.updatedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(quiz.updatedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quiz._id}/edit`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Quiz"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quiz._id}/preview`)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Preview Quiz"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ open: true, quiz })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Quiz"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                No Quizzes Created Yet
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first quiz to start assessing your students' knowledge.
              </p>
              <button
                onClick={() => navigate(`/tutor/course/${courseId}/quizzes/create`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Quiz</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the quiz "{deleteDialog.quiz?.title}"? 
                This action cannot be undone and all quiz attempts will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDialog({ open: false, quiz: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuiz(deleteDialog.quiz?._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}