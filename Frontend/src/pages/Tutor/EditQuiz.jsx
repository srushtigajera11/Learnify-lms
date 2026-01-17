import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  Circle, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function EditQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [openQ, setOpenQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch Quiz
  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const res = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
      const data = res.data.data;

      // Ensure options have IDs
      const mapped = {
        ...data,
        questions: data.questions.map((q) => ({
          ...q,
          options: q.options.map((o, idx) => ({
            ...o,
            id: o._id || `opt-${idx}-${Date.now()}`,
          })),
        })),
      };

      setQuizData(mapped);
    } catch (err) {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // Add Question
  const addQuestion = () => {
    const newQ = {
      questionText: "",
      questionType: "multiple-choice",
      points: 1,
      options: [
        { id: `opt1-${Date.now()}`, text: "", isCorrect: true },
        { id: `opt2-${Date.now()}`, text: "", isCorrect: false },
      ],
    };
    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setOpenQ(quizData.questions.length);
  };

  // Delete Question
  const deleteQuestion = (i) => {
    if (quizData.questions.length <= 1) {
      setError("Quiz must contain at least 1 question.");
      return;
    }
    const copy = [...quizData.questions];
    copy.splice(i, 1);
    setQuizData({ ...quizData, questions: copy });
    setOpenQ(Math.max(0, i - 1));
  };

  // Update Question Field
  const updateQuestion = (i, field, value) => {
    const copy = [...quizData.questions];
    copy[i][field] = value;
    setQuizData({ ...quizData, questions: copy });
  };

  // Add Option
  const addOption = (qi) => {
    const newOpt = { id: `opt-${Date.now()}`, text: "", isCorrect: false };
    const copy = [...quizData.questions];
    copy[qi].options.push(newOpt);
    setQuizData({ ...quizData, questions: copy });
  };

  // Delete Option
  const deleteOption = (qi, oi) => {
    const copy = [...quizData.questions];
    if (copy[qi].options.length <= 2) {
      setError("Each question must have at least 2 options.");
      return;
    }
    copy[qi].options.splice(oi, 1);
    // Ensure at least one isCorrect
    if (!copy[qi].options.some((o) => o.isCorrect)) {
      copy[qi].options[0].isCorrect = true;
    }
    setQuizData({ ...quizData, questions: copy });
  };

  // Update Option
  const updateOption = (qi, oi, field, value) => {
    const copy = [...quizData.questions];

    if (field === "isCorrect") {
      copy[qi].options.forEach((o, idx) => {
        o.isCorrect = idx === oi;
      });
    } else {
      copy[qi].options[oi][field] = value;
    }
    setQuizData({ ...quizData, questions: copy });
  };

  // Validation
  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      setError("Quiz title is required.");
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: text required.`);
        return false;
      }
      const validOpts = q.options.filter((o) => o.text.trim() !== "");
      if (validOpts.length < 2) {
        setError(`Question ${i + 1}: must have at least 2 valid options.`);
        return false;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        setError(`Question ${i + 1}: mark a correct option.`);
        return false;
      }
    }
    return true;
  };

  // Save Quiz
  const saveQuiz = async () => {
    if (!validateQuiz()) return;

    setSaving(true);
    try {
      const clean = {
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        maxAttempts: quizData.maxAttempts,
        shuffleQuestions: quizData.shuffleQuestions,
        isPublished: quizData.isPublished,
        questions: quizData.questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          options: q.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        })),
      };

      await axiosInstance.put(`/quizzes/quiz/${quizId}`, clean);
      navigate(`/tutor/course/${courseId}/quizzes`);
    } catch (err) {
      setError("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (!quizData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">Quiz not found</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPoints = quizData.questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Quiz</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            onClick={saveQuiz}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Quiz description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (mins)
                  </label>
                  <input
                    type="number"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing %
                  </label>
                  <input
                    type="number"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={quizData.maxAttempts}
                  onChange={(e) => setQuizData({ ...quizData, maxAttempts: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={quizData.shuffleQuestions}
                      onChange={(e) => setQuizData({ ...quizData, shuffleQuestions: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition ${quizData.shuffleQuestions ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform bg-white ${quizData.shuffleQuestions ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">Shuffle Questions</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={quizData.isPublished}
                      onChange={(e) => setQuizData({ ...quizData, isPublished: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition ${quizData.isPublished ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform bg-white ${quizData.isPublished ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">Publish Quiz</span>
                </label>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    Questions: {quizData.questions.length}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    Points: {totalPoints}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — QUESTIONS */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Questions</h2>

            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {quizData.questions.map((q, qi) => (
              <div
                key={qi}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div
                  className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => setOpenQ(openQ === qi ? -1 : qi)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        Q{qi + 1}. {q.questionText || "Untitled question"}
                      </h3>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 transition-transform ${openQ === qi ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* Question Details */}
                {openQ === qi && (
                  <div className="p-4 space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={q.questionText}
                        onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter question text"
                      />
                    </div>

                    {/* Question Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={q.questionType}
                          onChange={(e) => updateQuestion(qi, "questionType", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => updateQuestion(qi, "points", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Options</h4>
                      <div className="space-y-2">
                        {q.options.map((o, oi) => (
                          <div
                            key={o.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg ${
                              o.isCorrect
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <button
                              onClick={() => updateOption(qi, oi, "isCorrect", true)}
                              className="flex-shrink-0 text-gray-400 hover:text-green-600"
                            >
                              {o.isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <input
                              type="text"
                              value={o.text}
                              onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                              className="flex-1 px-3 py-2 border-none bg-transparent focus:outline-none focus:ring-0"
                              placeholder={`Option ${oi + 1}`}
                            />

                            <button
                              onClick={() => deleteOption(qi, oi)}
                              disabled={q.options.length <= 2}
                              className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addOption(qi)}
                        className="mt-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>

                    {/* Delete Question */}
                    <div className="pt-4 border-t">
                      <button
                        onClick={() => deleteQuestion(qi)}
                        disabled={quizData.questions.length <= 1}
                        className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {quizData.questions.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-600 mb-3">No questions added yet</p>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add First Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}