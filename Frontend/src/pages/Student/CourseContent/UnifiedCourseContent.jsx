import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  VideoLibrary,
  Description,
  Menu,
  PlayArrow,
  Lock,
  Close,
  Bolt,
  WorkspacePremium ,
  Notes,
  Article,
  Link as LinkIcon,
  Quiz as QuizIcon,
  AccessTime,
  Star,
  TrendingUp
} from "@mui/icons-material";
import axiosInstance from "../../../utils/axiosInstance";
import ReactPlayer from "react-player";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const UnifiedCourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentItemData, setCurrentItemData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Notes state
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadCourseContent();
  }, [courseId]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/students/course/${courseId}/content`);
      
      setCourse(res.data.course);
      setContentItems(res.data.content);
      setProgress(res.data.progress);

      // Load first uncompleted item or first item
      const firstUncompleted = res.data.content.find(item => !item.isCompleted);
      if (firstUncompleted) {
        await loadContentItem(firstUncompleted);
      } else if (res.data.content.length > 0) {
        await loadContentItem(res.data.content[0]);
      }
    } catch (err) {
      console.error("Error loading course:", err);
      setError(err.response?.data?.message || "Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  const loadContentItem = async (item) => {
    try {
      setCurrentItem(item);
      setQuizResult(null);
      setQuizAnswers({});

      if (item.type === 'lesson') {
        const res = await axiosInstance.get(
          `/students/course/${courseId}/lesson/${item._id}`
        );
        setCurrentItemData(res.data.lesson);
      } else if (item.type === 'quiz') {
        const res = await axiosInstance.get(
          `/students/course/${courseId}/quiz/${item._id}`
        );
        setCurrentItemData(res.data.quiz);
      }
    } catch (err) {
      console.error("Error loading content item:", err);
      setError("Failed to load content");
    }
  };

  const markLessonComplete = async () => {
    if (!currentItem || currentItem.type !== 'lesson') return;

    try {
      await axiosInstance.post(
        `/students/course/${courseId}/lesson/${currentItem._id}/complete`
      );
      // Reload to update progress
      await loadCourseContent();
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentItem || currentItem.type !== 'quiz') return;

    try {
      setQuizSubmitting(true);
      const res = await axiosInstance.post(
        `/students/course/${courseId}/quiz/${currentItem._id}/submit`,
        { answers: quizAnswers }
      );
      
      setQuizResult(res.data.result);
      
      // Reload to update progress and XP
      await loadCourseContent();
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Failed to submit quiz");
    } finally {
      setQuizSubmitting(false);
    }
  };

  const getVideoUrl = (materials) => {
    if (!materials?.length) return null;

    const videoMaterial = materials.find(m => {
      const url = m.url || "";
      const type = m.type || "";
      const isVideoType = type === "video" || type === "video_lesson";
      const isVideoUrl = /youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.ogg|\.mov|\.m4v/i.test(url);
      return isVideoType || isVideoUrl;
    });

    return videoMaterial?.url || null;
  };

  const navigateContent = (direction) => {
    const currentIndex = contentItems.findIndex(item => item._id === currentItem._id);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < contentItems.length) {
      loadContentItem(contentItems[newIndex]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <CircularProgressbar
              value={75}
              strokeWidth={6}
              styles={buildStyles({
                pathColor: '#5624d0',
                trailColor: '#e5e7eb',
              })}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Loading Course...</h3>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="w-full py-2.5 bg-[#5624d0] text-white font-semibold rounded-lg hover:bg-[#4a1fb8] mb-2"
          >
            Enroll in Course
          </button>
          <button
            onClick={() => navigate("/student/mylearning")}
            className="w-full py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = progress?.completionPercentage || 0;
  const currentIndex = currentItem ? contentItems.findIndex(item => item._id === currentItem._id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < contentItems.length - 1;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-1.5 hover:bg-gray-100 rounded lg:hidden"
            >
              <Menu fontSize="small" />
            </button>
            <button 
              onClick={() => navigate("/student/mylearning")} 
              className="flex items-center gap-1.5 text-gray-700 hover:text-[#5624d0]"
            >
              <ArrowBack fontSize="small" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
            <div className="hidden md:block h-4 w-px bg-gray-300"></div>
            <h1 className="text-sm font-bold text-gray-900 truncate">{course?.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Level Badge */}
            <div className="hidden md:flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
              <Star className="text-purple-600" style={{ fontSize: '16px' }} />
              <span className="text-sm font-bold text-purple-700">
                Lvl {progress?.level || 1}
              </span>
            </div>

            {/* XP Display */}
            <div className="hidden md:flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
              <Bolt className="text-yellow-600" style={{ fontSize: '16px' }} />
              <span className="text-sm font-bold text-yellow-700">
                {progress?.totalXP || 0} XP
              </span>
            </div>
            
            {/* Progress */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-600">{progressPercentage}%</span>
              <div className="w-10 h-10">
                <CircularProgressbar
                  value={progressPercentage}
                  strokeWidth={10}
                  styles={buildStyles({ pathColor: '#5624d0', trailColor: '#e5e7eb' })}
                />
              </div>
            </div>
            
            {/* Certificate Badge */}
            {progress?.certificateIssued && (
              <button 
                className="p-1.5 hover:bg-yellow-50 rounded border border-yellow-200"
                onClick={() => alert('Certificate feature coming soon!')}
              >
                <WorkspacePremium  className="text-yellow-600" fontSize="small" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - I'll provide this in next message to keep file size manageable */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300
          shadow-xl lg:shadow-none
        `}>
          {/* Sidebar content - ContentSidebar.jsx can be used here */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base text-gray-900">Course Content</h2>
              <button 
                onClick={() => setSidebarOpen(false)} 
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

            {/* XP and Level Display */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200 flex-1">
                <Bolt style={{ fontSize: '16px', color: '#d97706' }} />
                <span className="text-sm font-bold text-yellow-700">
                  {progress?.totalXP || 0} XP
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                <Star style={{ fontSize: '16px', color: '#9333ea' }} />
                <span className="text-sm font-bold text-purple-700">
                  Lvl {progress?.level || 1}
                </span>
              </div>
            </div>

            {progress?.certificateIssued && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                <Award style={{ fontSize: '16px', color: '#16a34a' }} />
                <span className="text-xs font-bold text-green-700">Certified!</span>
              </div>
            )}
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto">
            {contentItems.map((item, idx) => {
              const Icon = item.type === 'lesson' 
                ? (item.lessonType === 'video' ? VideoLibrary : Description)
                : QuizIcon;
              
              const iconColor = item.type === 'lesson'
                ? (item.lessonType === 'video' ? 'text-red-500' : 'text-blue-500')
                : (item.quizType === 'final' ? 'text-purple-600' : 'text-orange-500');

              const isCompleted = item.isCompleted;
              const isCurrent = currentItem?._id === item._id;

              return (
                <button
                  key={item._id}
                  onClick={() => loadContentItem(item)}
                  className={`w-full text-left p-3 border-b border-gray-100 flex items-start gap-3 transition-all ${
                    isCurrent 
                      ? 'bg-indigo-50 border-l-4 border-l-indigo-600' 
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Number/Status Circle */}
                  <div className={`flex items-center justify-center min-w-[24px] w-6 h-6 rounded-full mt-0.5 flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : isCurrent
                        ? 'bg-indigo-100 border-2 border-indigo-500'
                        : 'border-2 border-gray-300'
                  }`}>
                    {isCompleted ? (
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
                        <Award style={{ fontSize: '14px', color: '#9333ea' }} className="flex-shrink-0" />
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
                              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
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
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {currentItem && currentItemData ? (
            <div className="max-w-5xl mx-auto p-4">
              {/* Render lesson or quiz based on type */}
              {currentItem.type === 'lesson' ? (
                // LESSON CONTENT
                <>
                  {/* Video Player */}
                  {getVideoUrl(currentItemData.materials) && (
                    <div className="mb-4">
                      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                        <div className="relative aspect-video bg-black">
                          <ReactPlayer
                            url={getVideoUrl(currentItemData.materials)}
                            width="100%"
                            height="100%"
                            controls={true}
                            playing={false}
                            onEnded={markLessonComplete}
                            config={{
                              youtube: {
                                playerVars: { 
                                  showinfo: 1, 
                                  modestbranding: 1, 
                                  rel: 0
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lesson Title */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentItemData.title}</h2>
                    {currentItemData.description && (
                      <p className="text-gray-600">{currentItemData.description}</p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateContent('prev')}
                        disabled={!hasPrevious}
                        className="px-4 py-2 bg-white border border-gray-300 text-sm rounded-lg hover:border-indigo-500 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => navigateContent('next')}
                        disabled={!hasNext}
                        className="px-4 py-2 bg-white border border-gray-300 text-sm rounded-lg hover:border-indigo-500 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    
                    <button
                      onClick={markLessonComplete}
                      disabled={currentItem.isCompleted}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        currentItem.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <CheckCircle fontSize="small" />
                      {currentItem.isCompleted ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>

                  {/* Materials */}
                  {currentItemData.materials && currentItemData.materials.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                        <Article fontSize="small" />
                        Resources
                      </h3>
                      <div className="space-y-2">
                        {currentItemData.materials.map((material, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <VideoLibrary fontSize="small" className="text-red-500" />
                              <span className="text-sm font-medium">{material.name || 'Resource'}</span>
                            </div>
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-100"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // QUIZ CONTENT
                <>
                  {!quizResult ? (
                    // Quiz Taking View
                    <>
                      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                          {currentItem.quizType === 'final' ? (
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <Award className="text-purple-600" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <QuizIcon className="text-orange-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{currentItemData.title}</h2>
                            <p className="text-gray-600">{currentItemData.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Questions</div>
                            <div className="text-lg font-bold">{currentItemData.questions.length}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Time</div>
                            <div className="text-lg font-bold">{currentItemData.timeLimit || 'No'} min</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Passing</div>
                            <div className="text-lg font-bold">{currentItemData.passingScore}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">XP Reward</div>
                            <div className="text-lg font-bold text-yellow-600">+{currentItemData.xpReward}</div>
                          </div>
                        </div>

                        {currentItem.attempts > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-700">
                              Attempts: {currentItem.attempts}/{currentItem.maxAttempts} • 
                              Best Score: {currentItem.bestScore}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Questions */}
                      <div className="space-y-4 mb-4">
                        {currentItemData.questions.map((question, qIdx) => (
                          <div key={question._id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Q{qIdx + 1}. {question.questionText}
                            </h3>
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <label
                                  key={option._id}
                                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                    quizAnswers[question._id] === option._id 
                                      ? 'border-indigo-500 bg-indigo-50' 
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question._id}`}
                                    value={option._id}
                                    checked={quizAnswers[question._id] === option._id}
                                    onChange={() => setQuizAnswers({
                                      ...quizAnswers,
                                      [question._id]: option._id
                                    })}
                                    className="w-4 h-4 text-indigo-600"
                                  />
                                  <span className="flex-1 text-sm">{option.text}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Submit Button */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">
                              Answered: {Object.keys(quizAnswers).length} / {currentItemData.questions.length}
                            </div>
                          </div>
                          <button
                            onClick={handleQuizSubmit}
                            disabled={quizSubmitting || Object.keys(quizAnswers).length !== currentItemData.questions.length}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Quiz Results View
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="text-center mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          quizResult.passed ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {quizResult.passed ? (
                            <CheckCircle style={{ fontSize: '48px' }} className="text-green-600" />
                          ) : (
                            <Close style={{ fontSize: '48px' }} className="text-red-600" />
                          )}
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                          {quizResult.passed ? 'Congratulations!' : 'Keep Trying!'}
                        </h2>
                        <p className="text-gray-600">
                          You scored {quizResult.score.toFixed(1)}%
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-gray-900">{quizResult.score.toFixed(1)}%</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {quizResult.correctAnswers}/{quizResult.totalQuestions}
                          </div>
                          <div className="text-xs text-gray-600">Correct</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">+{quizResult.xpEarned}</div>
                          <div className="text-xs text-gray-600">XP Earned</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className={`text-2xl font-bold ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {quizResult.passed ? 'PASS' : 'FAIL'}
                          </div>
                          <div className="text-xs text-gray-600">Status</div>
                        </div>
                      </div>

                      {quizResult.certificateGenerated && (
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                          <div className="flex items-center gap-3">
                            <Award className="text-yellow-600" style={{ fontSize: '32px' }} />
                            <div>
                              <h3 className="font-bold text-yellow-900">Certificate Earned!</h3>
                              <p className="text-sm text-yellow-700">
                                You've completed the course and earned your certificate!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setQuizResult(null);
                            setQuizAnswers({});
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => navigateContent('next')}
                          disabled={!hasNext}
                          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-[#5624d0] to-[#7c3aed] rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayArrow className="text-white" style={{ fontSize: '40px' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Learn?</h3>
                <p className="text-gray-600 mb-6">Select a lesson or quiz from the sidebar to begin.</p>
                <button
                  onClick={() => contentItems.length > 0 && loadContentItem(contentItems[0])}
                  className="px-6 py-3 bg-[#5624d0] text-white font-bold rounded-lg hover:bg-[#4a1fb8]"
                >
                  Start First Item
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UnifiedCourseLearn;