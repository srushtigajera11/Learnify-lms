import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  Circle, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function CreateEditQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(quizId);

  const [loading, setLoading] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState("");
  const [openQuestion, setOpenQuestion] = useState(0);

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 1,
    shuffleQuestions: false,
    isPublished: false,
    questions: [
      {
        id: Date.now().toString(),
        questionText: "",
        questionType: "multiple-choice",
        options: [
          { id: "o1", text: "", isCorrect: true },
          { id: "o2", text: "", isCorrect: false },
        ],
        points: 1,
      },
    ],
  });

  useEffect(() => {
    if (!isEditing) return;
    const fetchQuiz = async () => {
      try {
        setLoadingQuiz(true);
        const res = await axiosInstance.get(`/quizzes/quiz/${quizId}`);
        const data = res.data.data;
        const mapped = {
          title: data.title || "",
          description: data.description || "",
          timeLimit: data.timeLimit ?? 30,
          passingScore: data.passingScore ?? 70,
          maxAttempts: data.maxAttempts ?? 1,
          shuffleQuestions: data.shuffleQuestions ?? false,
          isPublished: data.isPublished ?? false,
          questions: (data.questions || []).map((q) => ({
            id: q._id || Date.now().toString(),
            questionText: q.questionText || "",
            questionType: q.questionType || "multiple-choice",
            points: q.points ?? 1,
            options: (q.options || []).map((opt, idx) => ({
              id: opt._id || `opt-${idx}-${Date.now()}`,
              text: opt.text || "",
              isCorrect: !!opt.isCorrect,
            })),
          })),
        };
        if (mapped.questions.length === 0) {
          mapped.questions = [
            {
              id: Date.now().toString(),
              questionText: "",
              questionType: "multiple-choice",
              options: [
                { id: "o1", text: "", isCorrect: true },
                { id: "o2", text: "", isCorrect: false },
              ],
              points: 1,
            },
          ];
        }
        setQuizData(mapped);
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setError(err.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [isEditing, quizId]);

  const addQuestion = () => {
    const q = {
      id: Date.now().toString(),
      questionText: "",
      questionType: "multiple-choice",
      options: [
        { id: `${Date.now()}-o1`, text: "", isCorrect: true },
        { id: `${Date.now()}-o2`, text: "", isCorrect: false },
      ],
      points: 1,
    };
    setQuizData((prev) => ({ ...prev, questions: [...prev.questions, q] }));
    setOpenQuestion(quizData.questions.length);
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length <= 1) {
      setError("Quiz must have at least one question.");
      return;
    }
    const copy = [...quizData.questions];
    copy.splice(index, 1);
    setQuizData({ ...quizData, questions: copy });
    setError("");
    setOpenQuestion(Math.max(0, index - 1));
  };

  const updateQuestionField = (index, field, value) => {
    const copy = [...quizData.questions];
    copy[index] = { ...copy[index], [field]: value };
    setQuizData({ ...quizData, questions: copy });
  };

  const addOption = (qIndex) => {
    const copy = [...quizData.questions];
    const newOpt = { id: `${Date.now()}-opt-${copy[qIndex].options.length}`, text: "", isCorrect: false };
    copy[qIndex].options.push(newOpt);
    setQuizData({ ...quizData, questions: copy });
  };

  const removeOption = (qIndex, optIndex) => {
    const copy = [...quizData.questions];
    if (copy[qIndex].options.length <= 2) {
      setError("Each question needs at least 2 options.");
      return;
    }
    copy[qIndex].options.splice(optIndex, 1);
    if (!copy[qIndex].options.some((o) => o.isCorrect)) {
      copy[qIndex].options[0].isCorrect = true;
    }
    setQuizData({ ...quizData, questions: copy });
    setError("");
  };

  const updateOption = (qIndex, optIndex, field, value) => {
    const copy = [...quizData.questions];
    const opts = copy[qIndex].options.map((opt, idx) => ({ ...opt }));
    if (field === "isCorrect") {
      opts.forEach((o, i) => (o.isCorrect = i === optIndex ? value : false));
    } else {
      opts[optIndex][field] = value;
    }
    copy[qIndex].options = opts;
    setQuizData({ ...quizData, questions: copy });
  };

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      setError("Quiz title is required.");
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: text is required.`);
        return false;
      }
      const validOptions = q.options.filter((o) => o.text.trim() !== "");
      if (validOptions.length < 2) {
        setError(`Question ${i + 1}: at least 2 options required.`);
        return false;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        setError(`Question ${i + 1}: mark one correct answer.`);
        return false;
      }
      if (q.options.filter((o) => o.isCorrect).length > 1) {
        setError(`Question ${i + 1}: only one correct answer allowed.`);
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateQuiz()) return;
    setLoading(true);
    try {
      const payload = {
        title: quizData.title,
        description: quizData.description,
        timeLimit: Number(quizData.timeLimit) || 0,
        passingScore: Number(quizData.passingScore) || 0,
        maxAttempts: Number(quizData.maxAttempts) || 1,
        shuffleQuestions: !!quizData.shuffleQuestions,
        isPublished: !!quizData.isPublished,
        questions: quizData.questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: Number(q.points) || 1,
          options: q.options.map((o) => ({ text: o.text, isCorrect: !!o.isCorrect })),
        })),
      };

      if (isEditing) {
        await axiosInstance.put(`/quizzes/quiz/${quizId}`, payload);
      } else {
        await axiosInstance.post(`/quizzes/${courseId}`, payload);
      }
      navigate(`/tutor/course/${courseId}/quizzes`);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = quizData.questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </h1>
          <p className="text-gray-600 mt-1">
            Build assessments to test learners. Clean UI inspired by top platforms.
          </p>
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
            onClick={handleSave}
            disabled={loading || loadingQuiz}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quiz Settings Card */}
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
                  placeholder="Describe the quiz"
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
                    Pass %
                  </label>
                  <input
                    type="number"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                <div className="flex items-center">
                  <div className="flex items-center h-10">
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
                      <span className="ml-2 text-sm text-gray-700">Shuffle</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
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
                  <span className="ml-2 text-sm font-medium text-gray-700">Publish quiz</span>
                </label>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    Questions: {quizData.questions.length}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    Total points: {totalPoints}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${quizData.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {quizData.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Validation</h2>
            <p className="text-sm text-gray-600 mb-4">Quick checks before saving</p>
            
            <div className="space-y-2">
              {quizData.questions.map((q, i) => {
                const validOptions = q.options.filter((o) => o.text.trim() !== "");
                const hasCorrect = q.options.some((o) => o.isCorrect);
                const ok = validOptions.length >= 2 && hasCorrect && q.questionText.trim();
                
                return (
                  <div key={q.id} className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      Q{i + 1}
                    </span>
                    <span className={`text-sm ${ok ? 'text-green-600' : 'text-gray-500'}`}>
                      {ok ? "OK" : "Needs attention"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Questions */}
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

          {/* Questions List */}
          <div className="space-y-4">
            {quizData.questions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <h3 className="text-lg text-gray-600 mb-3">No questions yet</h3>
                <button
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add first question
                </button>
              </div>
            ) : (
              quizData.questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Question Header */}
                  <div
                    className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                    onClick={() => setOpenQuestion(openQuestion === qIndex ? -1 : qIndex)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          Q{qIndex + 1}. {question.questionText ? question.questionText.slice(0, 60) + (question.questionText.length > 60 ? "..." : "") : "New question"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{question.questionType}</span>
                          <span>•</span>
                          <span>{question.options.length} options</span>
                          <span>•</span>
                          <span>{question.points} pt</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(qIndex);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform ${openQuestion === qIndex ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question Details (Collapsible) */}
                  {openQuestion === qIndex && (
                    <div className="p-4">
                      <div className="space-y-4">
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question {qIndex + 1} text
                          </label>
                          <textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestionField(qIndex, "questionText", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your question"
                          />
                        </div>

                        {/* Question Type and Points */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={question.questionType}
                              onChange={(e) => updateQuestionField(qIndex, "questionType", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="multiple-choice">Multiple choice</option>
                              <option value="true-false">True / False</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Points
                            </label>
                            <input
                              type="number"
                              value={question.points}
                              onChange={(e) => updateQuestionField(qIndex, "points", Number(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Options */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Options</h4>
                          <div className="space-y-2">
                            {question.options.map((opt, optIndex) => (
                              <div
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 border rounded-lg ${
                                  opt.isCorrect
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-200"
                                }`}
                              >
                                <button
                                  onClick={() => updateOption(qIndex, optIndex, "isCorrect", true)}
                                  className="flex-shrink-0 text-gray-400 hover:text-green-600"
                                >
                                  {opt.isCorrect ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>

                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => updateOption(qIndex, optIndex, "text", e.target.value)}
                                  className="flex-1 px-3 py-2 border-none bg-transparent focus:outline-none focus:ring-0"
                                  placeholder={`Option ${optIndex + 1}`}
                                />

                                <button
                                  onClick={() => removeOption(qIndex, optIndex)}
                                  disabled={question.options.length <= 2}
                                  className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => addOption(qIndex)}
                            disabled={question.options.length >= 8}
                            className="mt-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            Add option ({question.options.length}/8)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}