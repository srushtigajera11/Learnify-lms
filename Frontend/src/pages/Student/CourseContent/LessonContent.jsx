import React from 'react';
import { Play, Image as ImageIcon, ExternalLink, FileText } from 'lucide-react';

export const LessonContent = ({ materials, title, description }) => {
  if (!materials || materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 bg-white rounded-xl border border-gray-200 p-8">
        <FileText className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">No materials available</p>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Materials */}
      <div className="space-y-4">
        {materials.map((material, idx) => {
          const url = material.url || "";
          const type = material.type || "";
          const name = material.name || "Resource";
    
          
          // Determine material type
          const isYouTube = /youtube\.com|youtu\.be/i.test(url);
          const isVimeo = /vimeo\.com/i.test(url);
          const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
          const isVideo = type === 'video' || type === 'video_lesson' || isYouTube || isVimeo || isDirectVideo;
          const isImage = type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
          const isDocument = type === 'document' || /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx)$/i.test(url);
          const isLink = type === 'link' && !isVideo;

          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Material Header */}
              <div className="flex items-center gap-3 mb-4">
                {isVideo && <Play className="w-5 h-5 text-red-500" />}
                {isImage && <ImageIcon className="w-5 h-5 text-indigo-500" />}
                {isLink && <ExternalLink className="w-5 h-5 text-emerald-500" />}
                {isDocument && <FileText className="w-5 h-5 text-amber-500" />}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{name}</h3>
                  {material.description && (
                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                  )}
                </div>

                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  {isVideo ? 'Video' : isImage ? 'Image' : isDocument ? 'Document' : 'Link'}
                </span>
              </div>

              {/* Material Content */}
              
              {/* YouTube Videos */}
              {isYouTube && (
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={url.replace('watch?v=', 'embed/')}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Vimeo Videos */}
              {isVimeo && !isYouTube && (
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Direct Video Files */}
              {isDirectVideo && !isYouTube && !isVimeo && (
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full"
                    preload="metadata"
                  >
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Images */}
              {isImage && (
                <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                  <img
                    src={url}
                    alt={name}
                    className="max-w-full max-h-96 object-contain rounded shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<p class="text-gray-500 text-sm">Failed to load image</p>';
                    }}
                  />
                </div>
              )}

              {/* External Links */}
              {isLink && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <ExternalLink size={18} />
                  Open External Link
                </a>
              )}

              {/* Documents */}
              {isDocument && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <FileText size={18} />
                  Download Document
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};