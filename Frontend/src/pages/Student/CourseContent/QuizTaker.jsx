import { useState } from "react";
import { submitQuiz } from "./fetchCourseData";

export default function QuizTaker({ quiz, courseId, quizId }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  if (!quiz) return null;

  const questions = quiz.questions || [];

  const handleSubmit = async () => {
    const res = await submitQuiz(courseId, quizId, answers);
    setResult(res);
  };

  if (result) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">Score: {result.score}%</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      {questions.map((q, i) => (
        <div key={q._id} className="mb-4">
          <p className="font-semibold">{i + 1}. {q.questionText}</p>

          {q.options.map(opt => (
            <label key={opt._id} className="block">
              <input
                type="radio"
                name={q._id}
                value={opt._id}
                onChange={() =>
                  setAnswers({ ...answers, [q._id]: opt._id })
                }
              />
              {opt.text}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-6 py-2 rounded"
      >
        Submit Quiz
      </button>
    </div>
  );
}