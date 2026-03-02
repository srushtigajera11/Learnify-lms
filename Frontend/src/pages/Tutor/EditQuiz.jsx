import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus, Trash2, Save, X, ChevronDown,
  Circle, CheckCircle2, AlertCircle, Trophy, Zap
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const defaultQuestion = () => ({
  id: Date.now().toString(),
  questionText: "",
  questionType: "multiple-choice",
  options: [
    { id: `${Date.now()}-o1`, text: "", isCorrect: true },
    { id: `${Date.now()}-o2`, text: "", isCorrect: false },
  ],
  points: 1,
});

export default function CreateEditQuiz() {
  const { courseId, quizId } = useParams();
  const navigate  = useNavigate();
  const isEditing = Boolean(quizId);

  const [loading,     setLoading]     = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error,       setError]       = useState("");
  const [openQuestion, setOpenQuestion] = useState(0);

  const [quizData, setQuizData] = useState({
    title:            "",
    description:      "",
    timeLimit:        30,
    passingScore:     70,
    maxAttempts:      1,
    shuffleQuestions: false,
    isPublished:      false,
    isFinal:          false,   // ← marks this as the final/certificate quiz
    xpReward:         10,      // ← XP students earn for passing
    questions:        [defaultQuestion()],
  });

  useEffect(() => {
    if (!isEditing) return;
    const fetchQuiz = async () => {
      try {
        setLoadingQuiz(true);
        const res  = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
        const data = res.data.data;
        setQuizData({
          title:            data.title || "",
          description:      data.description || "",
          timeLimit:        data.timeLimit ?? 30,
          passingScore:     data.passingScore ?? 70,
          maxAttempts:      data.maxAttempts ?? 1,
          shuffleQuestions: data.shuffleQuestions ?? false,
          isPublished:      data.isPublished ?? false,
          isFinal:          data.isFinal ?? data.generatesCertificate ?? false,
          xpReward:         data.xpReward ?? 10,
          questions: (data.questions || [defaultQuestion()]).map(q => ({
            id:           q._id || Date.now().toString(),
            questionText: q.questionText || "",
            questionType: q.questionType || "multiple-choice",
            points:       q.points ?? 1,
            options:      (q.options || []).map((opt, i) => ({
              id:        opt._id || `opt-${i}-${Date.now()}`,
              text:      opt.text || "",
              isCorrect: !!opt.isCorrect,
            })),
          })),
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [isEditing, quizId]);

  // ── question helpers ────────────────────────────────────────────────────────
  const addQuestion = () => {
    const q = defaultQuestion();
    setQuizData(prev => ({ ...prev, questions: [...prev.questions, q] }));
    setOpenQuestion(quizData.questions.length);
  };

  const removeQuestion = (i) => {
    if (quizData.questions.length <= 1) { setError("Quiz must have at least one question."); return; }
    const copy = [...quizData.questions];
    copy.splice(i, 1);
    setQuizData({ ...quizData, questions: copy });
    setError("");
    setOpenQuestion(Math.max(0, i - 1));
  };

  const updateQuestion = (i, field, value) => {
    const copy = [...quizData.questions];
    copy[i] = { ...copy[i], [field]: value };
    setQuizData({ ...quizData, questions: copy });
  };

  const addOption = (qi) => {
    const copy = [...quizData.questions];
    copy[qi].options.push({ id: `${Date.now()}-opt`, text: "", isCorrect: false });
    setQuizData({ ...quizData, questions: copy });
  };

  const removeOption = (qi, oi) => {
    const copy = [...quizData.questions];
    if (copy[qi].options.length <= 2) { setError("Each question needs at least 2 options."); return; }
    copy[qi].options.splice(oi, 1);
    if (!copy[qi].options.some(o => o.isCorrect)) copy[qi].options[0].isCorrect = true;
    setQuizData({ ...quizData, questions: copy });
    setError("");
  };

  const updateOption = (qi, oi, field, value) => {
    const copy = [...quizData.questions];
    if (field === "isCorrect") {
      copy[qi].options.forEach((o, i) => o.isCorrect = i === oi);
    } else {
      copy[qi].options[oi][field] = value;
    }
    setQuizData({ ...quizData, questions: copy });
  };

  // ── validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    if (!quizData.title.trim()) { setError("Quiz title is required."); return false; }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) { setError(`Q${i + 1}: question text required.`); return false; }
      if (q.options.filter(o => o.text.trim()).length < 2) { setError(`Q${i + 1}: at least 2 options required.`); return false; }
      if (!q.options.some(o => o.isCorrect)) { setError(`Q${i + 1}: mark one correct answer.`); return false; }
    }
    setError("");
    return true;
  };

  // ── save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        title:            quizData.title,
        description:      quizData.description,
        timeLimit:        Number(quizData.timeLimit) || 0,
        passingScore:     Number(quizData.passingScore) || 70,
        maxAttempts:      Number(quizData.maxAttempts) || 1,
        shuffleQuestions: !!quizData.shuffleQuestions,
        isPublished:      !!quizData.isPublished,
        isFinal:          !!quizData.isFinal,
        generatesCertificate: !!quizData.isFinal,  // keep in sync
        xpReward:         Number(quizData.xpReward) || 0,
        questions: quizData.questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points:       Number(q.points) || 1,
          options:      q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })),
        })),
      };

      if (isEditing) {
        await axiosInstance.put(`/quizzes/quiz/${quizId}`, payload);
      } else {
        await axiosInstance.post(`/quizzes/${courseId}`, payload);
      }
      navigate(`/tutor/course/${courseId}/quizzes`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = quizData.questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center cursor-pointer gap-3">
      <div className="relative flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Content appears in student sidebar ordered by creation date
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/tutor/course/${courseId}/quizzes`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || loadingQuiz}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Settings */}
        <div className="lg:col-span-1 space-y-4">

          {/* Basic Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Quiz Settings</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={quizData.title}
                onChange={e => setQuizData({ ...quizData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Quiz title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={quizData.description}
                onChange={e => setQuizData({ ...quizData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (mins)</label>
                <input type="number" value={quizData.timeLimit}
                  onChange={e => setQuizData({ ...quizData, timeLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pass %</label>
                <input type="number" value={quizData.passingScore}
                  onChange={e => setQuizData({ ...quizData, passingScore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                <input type="number" value={quizData.maxAttempts}
                  onChange={e => setQuizData({ ...quizData, maxAttempts: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" /> XP Reward
                </label>
                <input type="number" value={quizData.xpReward}
                  onChange={e => setQuizData({ ...quizData, xpReward: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Toggle
                checked={quizData.shuffleQuestions}
                onChange={e => setQuizData({ ...quizData, shuffleQuestions: e.target.checked })}
                label="Shuffle questions"
              />
              <Toggle
                checked={quizData.isPublished}
                onChange={e => setQuizData({ ...quizData, isPublished: e.target.checked })}
                label="Publish quiz"
              />
            </div>
          </div>

          {/* Final Quiz Toggle — separate card for emphasis */}
          <div className={`rounded-xl border-2 p-5 transition-colors ${
            quizData.isFinal
              ? 'border-purple-300 bg-purple-50'
              : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-start gap-3">
              <Trophy className={`w-5 h-5 flex-shrink-0 mt-0.5 ${quizData.isFinal ? 'text-purple-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-semibold text-sm ${quizData.isFinal ? 'text-purple-900' : 'text-gray-700'}`}>
                    Final Quiz
                  </p>
                  <Toggle
                    checked={quizData.isFinal}
                    onChange={e => setQuizData({ ...quizData, isFinal: e.target.checked })}
                    label=""
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Students must pass this quiz to unlock their certificate. Only one quiz per course should be marked Final.
                </p>
                {quizData.isFinal && (
                  <div className="mt-2 px-3 py-1.5 bg-purple-100 rounded-lg">
                    <p className="text-xs text-purple-700 font-medium">
                      🎓 Passing this quiz unlocks the Certificate of Completion
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {quizData.questions.length} questions
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {totalPoints} pts total
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                +{quizData.xpReward} XP
              </span>
              <span className={`px-3 py-1 text-xs rounded-full ${
                quizData.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {quizData.isPublished ? "Published" : "Draft"}
              </span>
              {quizData.isFinal && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  🏆 Final
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Questions */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Questions</h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <div className="space-y-3">
            {quizData.questions.map((question, qi) => (
              <div key={question.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between gap-3"
                  onClick={() => setOpenQuestion(openQuestion === qi ? -1 : qi)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {qi + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {question.questionText || "Untitled question"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); removeQuestion(qi); }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openQuestion === qi ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Body */}
                {openQuestion === qi && (
                  <div className="p-4 border-t border-gray-100 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question text</label>
                      <textarea
                        value={question.questionText}
                        onChange={e => updateQuestion(qi, "questionText", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={question.questionType}
                          onChange={e => updateQuestion(qi, "questionType", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="multiple-choice">Multiple choice</option>
                          <option value="true-false">True / False</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={e => updateQuestion(qi, "points", Number(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      {question.options.map((opt, oi) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg ${opt.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                        >
                          <button
                            onClick={() => updateOption(qi, oi, "isCorrect", true)}
                            className="flex-shrink-0"
                          >
                            {opt.isCorrect
                              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                              : <Circle className="w-5 h-5 text-gray-300" />
                            }
                          </button>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => updateOption(qi, oi, "text", e.target.value)}
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                            placeholder={`Option ${oi + 1}`}
                          />
                          <button
                            onClick={() => removeOption(qi, oi)}
                            disabled={question.options.length <= 2}
                            className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(qi)}
                        disabled={question.options.length >= 8}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" /> Add option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}