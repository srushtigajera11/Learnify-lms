import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  Play, 
  Image as ImageIcon, 
  ExternalLink, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import ReactPlayer from 'react-player';

const TutorLessonPreview = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);

  useEffect(() => {
    fetchLessonPreview();
  }, [lessonId]); // Re-fetch when lessonId changes

  const fetchLessonPreview = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axiosInstance.get(`/lessons/preview/${lessonId}`);
      
      console.log('Lesson data:', res.data); // Debug log
      
      setLesson(res.data.lesson);
      setAllLessons(res.data.allLessons);
      setCourse(res.data.course);
      setCurrentLessonId(lessonId);
      
    } catch (err) {
      console.error('Error fetching lesson preview:', err);
      setError(err.response?.data?.message || 'Failed to load lesson preview');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (selectedLessonId) => {
    // Update URL without full navigation
    window.history.pushState({}, '', `/tutor/lesson/${selectedLessonId}/preview`);
    
    // Manually trigger the fetch with new ID
    setCurrentLessonId(selectedLessonId);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Re-fetch with new lesson ID
    setLoading(true);
    axiosInstance.get(`/lessons/preview/${selectedLessonId}`)
      .then(res => {
        console.log('New lesson data:', res.data);
        setLesson(res.data.lesson);
        setAllLessons(res.data.allLessons);
        setCourse(res.data.course);
      })
      .catch(err => {
        console.error('Error loading new lesson:', err);
        setError(err.response?.data?.message || 'Failed to load lesson');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    return `${minutes} min`;
  };

  const getVideoUrl = () => {
    if (!lesson?.materials?.length) return null;

    const videoMaterial = lesson.materials.find(m => {
      const url = m.url || "";
      const type = m.type || "";
      const isVideoType = type === "video" || type === "video_lesson";
      const isVideoUrl = /youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.ogg|\.mov|\.m4v/i.test(url);
      return isVideoType || isVideoUrl;
    });

    return videoMaterial?.url || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading lesson preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Preview</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl();
  const progressPercentage = 0; // Tutors don't have progress
  const completedLessonIds = []; // Tutors don't track completion

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lessons
          </button>
          
          <h2 className="font-bold text-slate-900 text-lg mb-4">Course Content</h2>
          
          {/* Progress Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span className="font-medium">Preview Mode</span>
              <span className="font-semibold text-indigo-600">Tutor View</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: '0%' }}
              />
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mt-3 font-medium">
            {allLessons.length} lessons total
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {allLessons.map((lessonItem, idx) => {
            const isCurrent = lessonItem._id === currentLessonId;
            const isCompleted = false;

            return (
              <button
                key={lessonItem._id}
                onClick={() => handleLessonSelect(lessonItem._id)}
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
                      {lessonItem.title}
                    </span>
                    {lessonItem.isPreview && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2">
                        Free
                      </span>
                    )}
                  </div>

                  {lessonItem.duration && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">{formatDuration(lessonItem.duration)}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-5 border-t border-slate-200 bg-slate-50">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-indigo-700">Preview Mode</p>
            <p className="text-xs text-indigo-600 mt-1">Viewing as instructor</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Course Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <span className="font-medium">{course?.title}</span>
              <span>•</span>
              <span>Lesson {lesson?.order}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{lesson?.title}</h1>
            {lesson?.description && (
              <p className="text-slate-600 mt-2 leading-relaxed">{lesson?.description}</p>
            )}
          </div>

          {/* Video Player */}
          {videoUrl && (
            <div className="mb-8">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-video bg-black">
                  <ReactPlayer
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    config={{
                      youtube: {
                        playerVars: { 
                          showinfo: 1, 
                          modestbranding: 1, 
                          rel: 0
                        }
                      },
                      vimeo: {
                        playerOptions: {
                          autoplay: false
                        }
                      },
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Materials */}
          {lesson?.materials && lesson.materials.length > 0 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Lesson Materials</h2>
                <p className="text-slate-600 mt-1">Resources and content for this lesson</p>
              </div>

              {lesson.materials.map((material, idx) => {
                console.log('Rendering material:', material); // Debug log
                
                // Improved material type detection
                const url = material.url || "";
                const type = material.type || "";
                
                const isVideo = type === 'video' || 
                               type === 'video_lesson' ||
                               /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
                
                const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
                const isImage = type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                const isDocument = type === 'document' || /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx)$/i.test(url);
                const isLink = type === 'link' && !isVideo && !isDirectVideo && !isImage && !isDocument;

                // Don't show the main video again if it's already displayed at the top
                if (isVideo && url === videoUrl) {
                  return null;
                }

                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      {(isVideo || isDirectVideo) && <Play className="w-5 h-5 text-red-500" />}
                      {isImage && <ImageIcon className="w-5 h-5 text-indigo-500" />}
                      {isLink && <ExternalLink className="w-5 h-5 text-emerald-500" />}
                      {isDocument && <FileText className="w-5 h-5 text-amber-500" />}
                      <h3 className="font-semibold text-slate-900">{material.name || 'Untitled Material'}</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {type}
                      </span>
                    </div>

                    {material.description && (
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">{material.description}</p>
                    )}

                    {/* YouTube/Vimeo Video */}
                    {isVideo && (
                      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                        <ReactPlayer
                          url={url}
                          controls={true}
                          width="100%"
                          height="100%"
                          config={{
                            youtube: { 
                              playerVars: { 
                                showinfo: 1, 
                                modestbranding: 1, 
                                rel: 0 
                              } 
                            },
                            vimeo: { 
                              playerOptions: { 
                                autoplay: false 
                              } 
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Direct Video File */}
                    {isDirectVideo && !isVideo && (
                      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                        <video
                          controls
                          className="w-full h-full object-contain"
                          preload="metadata"
                        >
                          <source src={url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Image */}
                    {isImage && (
                      <div className="flex justify-center bg-slate-50 rounded-xl p-4">
                        <img
                          src={url}
                          alt={material.name || 'Material image'}
                          className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            console.error('Image load error:', url);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<p class="text-slate-500 text-sm">Failed to load image</p>';
                          }}
                        />
                      </div>
                    )}

                    {/* External Link */}
                    {isLink && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors"
                      >
                        <ExternalLink size={18} />
                        Open External Link
                      </a>
                    )}

                    {/* Document Download */}
                    {isDocument && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-amber-50 text-amber-700 font-medium rounded-xl hover:bg-amber-100 transition-colors"
                      >
                        <FileText size={18} />
                        View/Download Document
                      </a>
                    )}

                    {/* Fallback for unknown types */}
                    {!isVideo && !isDirectVideo && !isImage && !isLink && !isDocument && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink size={18} />
                        Open Material
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {(!lesson?.materials || lesson.materials.length === 0) && !videoUrl && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No materials available</p>
              <p className="text-sm mt-1">Add materials to this lesson to display them here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorLessonPreview;