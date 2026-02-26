import React, { useState, useEffect } from "react";
import { submitQuiz } from "./fetchCourseData";
import {
  CheckCircle,
  Cancel,
  EmojiEvents,
  AccessTime,
  Assignment,
  TrendingUp,
  Bolt,
  WorkspacePremium,
  RefreshOutlined,
  SendOutlined,
  RadioButtonUnchecked,
  RadioButtonChecked,
  WarningAmber
} from "@mui/icons-material";

export default function QuizTaker({ quiz, courseId, quizId, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize timer if quiz has time limit
  useEffect(() => {
    if (quiz?.timeLimit && !result) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz, result]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const formatTime = (seconds) => {
    if (seconds === null) return "No limit";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const res = await submitQuiz(courseId, quizId, answers);
      setResult(res);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Quiz submission error:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Assignment style={{ fontSize: 64 }} className="text-gray-300 mb-4" />
          <p className="text-gray-500">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // RESULTS VIEW
  if (result) {
    const isPassed = result.passed;
    const scorePercentage = Math.round(result.score);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className={`rounded-2xl p-8 mb-6 text-center ${
          isPassed 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
            : 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200'
        }`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <CheckCircle style={{ fontSize: 48 }} className="text-green-600" />
            ) : (
              <Cancel style={{ fontSize: 48 }} className="text-red-600" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            {isPassed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            {isPassed 
              ? `You passed with a score of ${scorePercentage}%` 
              : `You scored ${scorePercentage}%. Passing score is ${quiz.passingScore}%`
            }
          </p>

          {/* XP Badge */}
          {result.xpEarned > 0 && (
            <div className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 px-4 py-2 rounded-full">
              <Bolt className="text-yellow-600" />
              <span className="font-bold text-yellow-900">+{result.xpEarned} XP Earned!</span>
            </div>
          )}

          {/* Certificate Badge */}
          {result.certificateGenerated && (
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-100 border-2 border-purple-300 px-4 py-2 rounded-full">
              <WorkspacePremium className="text-purple-600" />
              <span className="font-bold text-purple-900">Certificate Unlocked! 🎓</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <TrendingUp className="text-indigo-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{scorePercentage}%</div>
            <div className="text-xs text-gray-600 mt-1">Your Score</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">
              {result.correctAnswers}/{result.totalQuestions}
            </div>
            <div className="text-xs text-gray-600 mt-1">Correct Answers</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <Assignment className="text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">
              {result.earnedPoints}/{result.totalPoints}
            </div>
            <div className="text-xs text-gray-600 mt-1">Points</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <EmojiEvents className={isPassed ? "text-green-600" : "text-red-600"} />
            <div className={`text-2xl font-bold mt-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {isPassed ? 'PASSED' : 'FAILED'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Status</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Assignment />
            Answer Review
          </h3>
          
          <div className="space-y-4">
            {result.answers.map((answer, idx) => {
              const question = questions[idx];
              const selectedOption = question?.options.find(opt => opt._id === answer.selectedOption);
              const correctOption = question?.options.find(opt => opt.isCorrect);

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    answer.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {answer.isCorrect ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <Cancel className="text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        Q{idx + 1}. {question?.questionText}
                      </p>
                      
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Your answer:</span>{" "}
                          <span className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                            {selectedOption?.text || 'Not answered'}
                          </span>
                        </p>
                        
                        {!answer.isCorrect && (
                          <p className="text-gray-700">
                            <span className="font-medium">Correct answer:</span>{" "}
                            <span className="text-green-700">{correctOption?.text}</span>
                          </p>
                        )}
                        
                        <p className="text-gray-600">
                          {answer.isCorrect ? `✓ +${answer.pointsEarned} points` : '✗ 0 points'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {quiz.attempts < quiz.maxAttempts && (
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              <RefreshOutlined />
              Try Again ({quiz.attempts + 1}/{quiz.maxAttempts} attempts)
            </button>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Continue Learning
          </button>
        </div>

        {/* Attempt Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          Attempt {result.attemptNumber} of {quiz.maxAttempts} • 
          {quiz.attempts >= quiz.maxAttempts 
            ? ' No more attempts remaining' 
            : ` ${quiz.maxAttempts - quiz.attempts} attempts left`
          }
        </div>
      </div>
    );
  }

  // QUIZ TAKING VIEW
  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Assignment className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.quizType === 'final' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  FINAL QUIZ
                </span>
              )}
            </div>
            {quiz.description && (
              <p className="text-gray-600">{quiz.description}</p>
            )}
          </div>
        </div>

        {/* Quiz Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Assignment fontSize="small" className="text-indigo-600" />
              <span className="text-xs text-gray-600">Questions</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{questions.length}</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <AccessTime fontSize="small" className="text-indigo-600" />
              <span className="text-xs text-gray-600">Time Limit</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp fontSize="small" className="text-indigo-600" />
              <span className="text-xs text-gray-600">Passing Score</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{quiz.passingScore}%</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Bolt fontSize="small" className="text-yellow-600" />
              <span className="text-xs text-gray-600">XP Reward</span>
            </div>
            <div className="text-lg font-bold text-yellow-600">+{quiz.xpReward}</div>
          </div>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
              <div className={`flex items-center gap-2 ${
                timeLeft < 60 ? 'text-red-600' : 'text-indigo-600'
              }`}>
                <AccessTime fontSize="small" />
                <span className="text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  timeLeft < 60 ? 'bg-red-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${(timeLeft / (quiz.timeLimit * 60)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Previous Attempts */}
        {quiz.attempts > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <WarningAmber fontSize="small" />
              <span>
                Previous attempts: {quiz.attempts}/{quiz.maxAttempts} • 
                Best score: {quiz.bestScore}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {answeredCount}/{questions.length} questions
          </span>
          <span className="text-sm font-bold text-indigo-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {questions.map((question, idx) => {
          const isAnswered = answers[question._id] !== undefined;

          return (
            <div
              key={question._id}
              className={`bg-white rounded-xl border-2 p-6 transition-all ${
                isAnswered 
                  ? 'border-indigo-200 bg-indigo-50/30' 
                  : 'border-gray-200 hover:border-indigo-100'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex items-center justify-center min-w-[32px] h-8 rounded-full font-bold text-sm ${
                  isAnswered 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {question.questionText}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{question.questionType === 'true-false' ? 'True/False' : 'Multiple Choice'}</span>
                    <span>•</span>
                    <span>{question.points} {question.points === 1 ? 'point' : 'points'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {question.options.map((option) => {
                  const isSelected = answers[question._id] === option._id;

                  return (
                    <label
                      key={option._id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <RadioButtonChecked className="text-indigo-600" />
                        ) : (
                          <RadioButtonUnchecked className="text-gray-400" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name={question._id}
                        value={option._id}
                        checked={isSelected}
                        onChange={() =>
                          setAnswers({ ...answers, [question._id]: option._id })
                        }
                        className="sr-only"
                      />
                      <span className={`flex-1 ${
                        isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'
                      }`}>
                        {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 sticky bottom-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-1">
              {allAnswered 
                ? '✓ All questions answered' 
                : `${questions.length - answeredCount} questions remaining`
              }
            </div>
            {!allAnswered && (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                <WarningAmber fontSize="small" />
                Please answer all questions before submitting
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
              allAnswered && !isSubmitting
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshOutlined className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <SendOutlined />
                Submit Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}