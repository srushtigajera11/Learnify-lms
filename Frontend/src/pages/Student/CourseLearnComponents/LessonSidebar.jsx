import React from 'react';
import { CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

export const LessonSidebar = ({
  lessons,
  currentLessonId,
  completedLessonIds,
  onLessonSelect,
  onMarkComplete,
}) => {
  const completedCount = completedLessonIds.length;
  const totalLessons = lessons.length;

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    return `${minutes} min`;
  };

  return (
    <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="font-bold text-slate-900 text-lg mb-4">Course Content</h2>
        <ProgressBar completed={completedCount} total={totalLessons} />
        <p className="text-sm text-slate-600 mt-3 font-medium">
          {completedCount} of {totalLessons} lessons completed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {lessons.map((lesson, idx) => {
          const isCurrent = lesson._id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson._id);

          return (
            <button
              key={lesson._id}
              onClick={() => onLessonSelect(lesson._id)}
              className={`w-full text-left p-4 flex items-start gap-3 border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 ${
                isCurrent ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                isCompleted 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : isCurrent 
                    ? 'border-indigo-600 bg-indigo-100' 
                    : 'border-slate-300'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="text-emerald-600 w-4 h-4" />
                ) : isCurrent ? (
                  <PlayCircle className="text-indigo-600 w-4 h-4" />
                ) : (
                  <span className="text-xs font-semibold text-slate-500">{idx + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium text-sm leading-tight ${
                    isCurrent ? 'text-indigo-700' : 'text-slate-900'
                  }`}>
                    {lesson.title}
                  </span>
                  {lesson.isPreview && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2">
                      Free
                    </span>
                  )}
                </div>

                {lesson.duration && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">{formatDuration(lesson.duration)}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-5 border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => currentLessonId && onMarkComplete(currentLessonId)}
          disabled={!currentLessonId || completedLessonIds.includes(currentLessonId || '')}
          className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            !currentLessonId || completedLessonIds.includes(currentLessonId || '')
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200'
          }`}
        >
          {completedLessonIds.includes(currentLessonId || '') ? (
            <>
              <CheckCircle2 size={18} />
              Lesson Completed
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Mark as Complete
            </>
          )}
        </button>
      </div>
    </aside>
  );
};