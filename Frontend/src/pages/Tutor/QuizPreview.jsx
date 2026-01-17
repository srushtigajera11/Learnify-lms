import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  BookOpen,
  BarChart3,
  RefreshCw,
  Send,
  Edit
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function QuizPreview() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuiz();
    // cleanup timer on unmount
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizId]);

  useEffect(() => {
    if (!timeLeft || isSubmitted) return;
    timerRef.current = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, isSubmitted]);

  useEffect(() => {
    if (timeLeft === 0 && quiz && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, quiz, isSubmitted]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
      const data = res.data.data;
      setQuiz(data);
      if (data.timeLimit) setTimeLeft(data.timeLimit * 60);
    } catch (err) {
      console.error("Load quiz error:", err);
      setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const formatTime = (seconds) => {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const calculateResults = () => {
    if (!quiz) return null;
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctAnswers = 0;
    const detailed = quiz.questions.map((q) => {
      totalPoints += q.points;
      const selected = answers[q._id];
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = selected && correctOption && selected === correctOption._id;
      if (isCorrect) {
        correctAnswers += 1;
        earnedPoints += q.points;
      }
      return {
        question: q.questionText,
        userAnswer: selected ? (q.options.find((o) => o._id === selected)?.text ?? "Unknown") : "Not answered",
        correctAnswer: correctOption ? correctOption.text : "N/A",
        isCorrect,
        points: q.points,
        pointsEarned: isCorrect ? q.points : 0,
      };
    });
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= (quiz.passingScore ?? 0);
    return { score, passed, correctAnswers, totalQuestions: quiz.questions.length, totalPoints, earnedPoints, detailedResults: detailed };
  };

  const handleSubmit = () => {
    const res = calculateResults();
    setResults(res);
    setIsSubmitted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setResults(null);
    if (quiz?.timeLimit) setTimeLeft(quiz.timeLimit * 60);
  };

  const scrollToQuestion = (index) => {
    const questionElements = document.querySelectorAll(".question-card");
    if (questionElements[index]) {
      questionElements[index].scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-700">Quiz not found</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to quizzes
        </button>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full border border-blue-200">
          PREVIEW MODE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Quiz Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-3">
              {quiz.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {quiz.description || "No description provided."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Questions</p>
                  <p className="text-lg font-semibold">{quiz.questions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-lg font-semibold">{quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Passing</p>
                  <p className="text-lg font-semibold">{quiz.passingScore}%</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Max attempts</p>
                <p className="text-lg font-semibold">{quiz.maxAttempts}</p>
              </div>
            </div>

            {quiz.timeLimit && !isSubmitted && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Timer</p>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-blue-700 min-w-[80px]">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(timeLeft / (quiz.timeLimit * 60)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results (if submitted) */}
          {isSubmitted && results && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">Preview Results</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className={`text-3xl font-bold ${results.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {results.score.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Score</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {results.correctAnswers}/{results.totalQuestions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Correct</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {results.earnedPoints}/{results.totalPoints}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Points</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    results.passed 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {results.passed ? "PASSED" : "FAILED"}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">Status</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
                <div className="space-y-3">
                  {results.detailedResults.map((r, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        r.isCorrect 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 mb-2">
                        Q{idx + 1}: {r.question}
                      </p>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-700">Your answer: {r.userAnswer}</p>
                        <p className="text-gray-700">Correct answer: {r.correctAnswer}</p>
                        <p className={r.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                          {r.isCorrect ? `✓ +${r.pointsEarned} points` : "✗ 0 points"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
                <button
                  onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quizId}/edit`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit quiz
                </button>
              </div>
            </div>
          )}

          {/* Questions list (if not submitted) */}
          {!isSubmitted && (
            <>
              {quiz.questions.map((q, idx) => (
                <div 
                  key={q._id} 
                  className="question-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Q{idx + 1} 
                        <span className="text-gray-600 text-sm ml-2">{q.points} pt</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {q.questionType === "multiple-choice" ? "Multiple choice" : "True/False"}
                    </span>
                  </div>

                  <p className="text-gray-800 mb-4">{q.questionText}</p>

                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt._id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          answers[q._id] === opt._id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q._id}`}
                          value={opt._id}
                          checked={answers[q._id] === opt._id}
                          onChange={() => handleChoose(q._id, opt._id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="flex-1">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-gray-600">
                      Answered: {Object.keys(answers).length} / {quiz.questions.length}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={Object.keys(answers).length !== quiz.questions.length}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit
                    </button>
                  </div>
                </div>

                {Object.keys(answers).length !== quiz.questions.length && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-yellow-700">
                        Please answer all questions to see results. You have answered {Object.keys(answers).length}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Quiz Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Quiz at a glance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total questions</span>
                  <span className="font-medium">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total points</span>
                  <span className="font-medium">{totalPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time limit</span>
                  <span className="font-medium">{quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Passing score</span>
                  <span className="font-medium">{quiz.passingScore}%</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Jump to question</h4>
                <div className="space-y-1">
                  {quiz.questions.map((q, i) => (
                    <button
                      key={q._id}
                      onClick={() => scrollToQuestion(i)}
                      className="w-full flex justify-between items-center p-2 text-left text-sm hover:bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-700">Q{i + 1}</span>
                      <span className="text-gray-500 text-xs">{q.points} pt</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/tutor/course/${courseId}/quizzes/${quizId}/edit`)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit quiz
                </button>
                <button
                  onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Back to list
                </button>
              </div>
            </div>

            {/* Progress Stats */}
            {!isSubmitted && Object.keys(answers).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Your Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Answered</span>
                    <span className="font-medium">{Object.keys(answers).length}/{quiz.questions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-medium">{quiz.questions.length - Object.keys(answers).length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}