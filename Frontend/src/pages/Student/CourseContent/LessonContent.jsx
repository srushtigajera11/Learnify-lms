import React from 'react';
import { Play, Image as ImageIcon, ExternalLink, FileText } from 'lucide-react';

export const LessonContent = ({ materials, title, description }) => {
  if (!materials || materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <FileText className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">No materials available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        {description && <p className="text-slate-600 leading-relaxed">{description}</p>}
      </div>

      <div className="space-y-6">
        {materials.map((material, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              {material.type === 'video' && <Play className="w-5 h-5 text-red-500" />}
              {material.type === 'image' && <ImageIcon className="w-5 h-5 text-indigo-500" />}
              {material.type === 'link' && <ExternalLink className="w-5 h-5 text-emerald-500" />}
              {material.type === 'document' && <FileText className="w-5 h-5 text-amber-500" />}
              <h3 className="font-semibold text-slate-900">{material.name}</h3>
            </div>

            {material.description && (
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">{material.description}</p>
            )}

            {material.type === 'video' && (
              <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                <video
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                >
                  <source src={material.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {material.type === 'image' && (
              <div className="flex justify-center bg-slate-50 rounded-xl p-4">
                <img
                  src={material.url}
                  alt={material.name}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
                />
              </div>
            )}

            {material.type === 'link' && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <ExternalLink size={18} />
                Open External Link
              </a>
            )}

            {material.type === 'document' && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-amber-50 text-amber-700 font-medium rounded-xl hover:bg-amber-100 transition-colors"
              >
                <FileText size={18} />
                Download Document
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};