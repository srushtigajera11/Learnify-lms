import React from 'react';
import {
  CheckCircle,
  PlayCircle,
  Description,
  Quiz as QuizIcon,
  AccessTime,
  Bolt,
  WorkspacePremium,
  Close,
  Lock
} from '@mui/icons-material';

const ContentSidebar = ({ 
  isOpen, 
  onClose, 
  contentItems, 
  currentItem, 
  progress,
  onSelectItem 
}) => {
  
  const getItemIcon = (item) => {
    if (item.type === 'lesson') {
      return item.lessonType === 'video' ? PlayCircle : Description;
    }
    return QuizIcon;
  };

  const getItemColor = (item) => {
    if (item.type === 'lesson') {
      return item.lessonType === 'video' ? 'text-red-500' : 'text-blue-500';
    }
    return item.quizType === 'final' ? 'text-purple-600' : 'text-orange-500';
  };

  const formatDuration = (item) => {
    if (item.type === 'quiz') {
      // Quiz duration is in minutes
      return `${item.duration} min`;
    } else {
      // Lesson duration is in seconds
      const mins = Math.floor(item.duration / 60);
      const secs = item.duration % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const progressPercentage = progress?.completionPercentage || 0;

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
      w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300
      shadow-xl lg:shadow-none
    `}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base text-gray-900">Course Content</h2>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 hover:bg-white rounded-lg"
          >
            <Close fontSize="small" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-700 font-medium">
              {progress?.completedItems || 0}/{progress?.totalItems || 0} complete
            </span>
            <span className="font-bold text-indigo-600">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* XP Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
            <Bolt style={{ fontSize: '16px', color: '#d97706' }} />
            <span className="text-sm font-bold text-yellow-700">
              {progress?.totalXP || 0} XP
            </span>
          </div>
          {progress?.certificateIssued && (
            <div className="flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
              <WorkspacePremium style={{ fontSize: '16px', color: '#9333ea' }} />
              <span className="text-xs font-bold text-purple-700">Certified</span>
            </div>
          )}
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto">
        {contentItems.map((item, idx) => {
          const Icon = getItemIcon(item);
          const iconColor = getItemColor(item);
          const isCompleted = item.isCompleted;
          const isCurrent = currentItem?._id === item._id;
          const isLocked = false; // You can implement locking logic

          return (
            <button
              key={item._id}
              onClick={() => !isLocked && onSelectItem(item)}
              disabled={isLocked}
              className={`w-full text-left p-3 border-b border-gray-100 flex items-start gap-3 transition-all ${
                isCurrent 
                  ? 'bg-indigo-50 border-l-4 border-l-indigo-600' 
                  : 'hover:bg-gray-50 border-l-4 border-l-transparent'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Number/Status Circle */}
              <div className={`flex items-center justify-center min-w-[24px] w-6 h-6 rounded-full mt-0.5 flex-shrink-0 ${
                isCompleted 
                  ? 'bg-green-100 border-2 border-green-500' 
                  : isCurrent
                    ? 'bg-indigo-100 border-2 border-indigo-500'
                    : 'border-2 border-gray-300'
              }`}>
                {isLocked ? (
                  <Lock style={{ fontSize: '14px', color: '#9ca3af' }} />
                ) : isCompleted ? (
                  <CheckCircle style={{ fontSize: '16px', color: '#10b981' }} />
                ) : (
                  <span className="text-[11px] font-bold text-gray-600">{idx + 1}</span>
                )}
              </div>
              
              {/* Content Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-medium leading-tight ${
                    isCurrent ? 'text-indigo-700' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                  {item.type === 'quiz' && item.quizType === 'final' && (
                    <WorkspacePremium style={{ fontSize: '14px', color: '#9333ea' }} className="flex-shrink-0" />
                  )}
                </div>

                {/* Type and Duration */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Icon style={{ fontSize: '14px' }} className={iconColor} />
                    <span className="text-[11px] text-gray-600 capitalize">
                      {item.type}
                    </span>
                  </div>

                  {item.duration > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-0.5">
                        <AccessTime style={{ fontSize: '12px', color: '#9ca3af' }} />
                        <span className="text-[11px] text-gray-500">
                          {formatDuration(item)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Quiz Badges */}
                  {item.type === 'quiz' && (
                    <>
                      <span className="text-gray-400">•</span>
                      {item.quizType === 'practice' && item.xpReward > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">
                          +{item.xpReward} XP
                        </span>
                      )}
                      {item.quizType === 'final' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                          Final
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Quiz Attempts Info */}
                {item.type === 'quiz' && item.attempts > 0 && (
                  <div className="mt-1 text-[11px]">
                    <span className="text-gray-600">
                      Best: {item.bestScore}% • {item.attempts}/{item.maxAttempts} attempts
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Course Progress</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-24 h-24">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  className="circle"
                  strokeDasharray={`${progressPercentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <text 
                  x="18" 
                  y="20.5" 
                  className="text-[8px] font-bold fill-indigo-600"
                  textAnchor="middle"
                >
                  {progressPercentage}%
                </text>
              </svg>
            </div>
          </div>
          {!progress?.certificateIssued && progressPercentage === 100 && (
            <p className="text-xs text-green-600 font-medium mt-2">
              🎉 Complete the final quiz for your certificate!
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ContentSidebar;