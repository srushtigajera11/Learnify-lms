import React, { useState } from 'react';
import {
  WorkspacePremium,
  Download,
  Verified,
  EmojiEvents,
  Star,
  CalendarToday,
  School,
  CheckCircle
} from '@mui/icons-material';
import axiosInstance from '../../../utils/axiosInstance';

export default function CertificateViewer({ courseId, certificate, isLocked, onClaim }) {
  const [claiming, setClaiming] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleClaim = async () => {
    if (isLocked || certificate) return;

    try {
      setClaiming(true);
      const res = await axiosInstance.post(`/certificates/claim/${courseId}`);
      
      if (res.data.success) {
        if (onClaim) onClaim(res.data.data);
      }
    } catch (error) {
      console.error('Error claiming certificate:', error);
      alert(error.response?.data?.message || 'Failed to claim certificate');
    } finally {
      setClaiming(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;

    try {
      setDownloading(true);
      const res = await axiosInstance.get(
        `/certificates/download/${certificate.certificateId}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificate.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  // LOCKED STATE
  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-300">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <WorkspacePremium style={{ fontSize: 64, color: '#9ca3af' }} />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-700 mb-3">
              Certificate Locked 🔒
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              Complete all lessons and pass the final quiz to unlock your certificate
            </p>

            <div className="bg-white rounded-xl p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Requirements:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <CheckCircle style={{ fontSize: 16, color: '#9ca3af' }} />
                  </div>
                  <span className="text-sm text-gray-700">Complete all lessons</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <CheckCircle style={{ fontSize: 16, color: '#9ca3af' }} />
                  </div>
                  <span className="text-sm text-gray-700">Pass all quizzes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <CheckCircle style={{ fontSize: 16, color: '#9ca3af' }} />
                  </div>
                  <span className="text-sm text-gray-700">Pass the final quiz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CLAIMED STATE
  if (certificate) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <WorkspacePremium style={{ fontSize: 64, color: '#9333ea' }} />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Congratulations! 🎉
            </h2>
            
            <p className="text-lg text-gray-700 mb-6">
              You've earned your Certificate of Completion
            </p>
          </div>

          {/* Certificate Preview */}
          <div className="bg-white rounded-xl border-4 border-purple-300 p-8 mb-6 shadow-xl">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <EmojiEvents style={{ fontSize: 48, color: '#d97706' }} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900">
                Certificate of Completion
              </h3>
              
              <div className="h-px bg-purple-200 w-32 mx-auto"></div>
              
              <p className="text-gray-600">This certifies that</p>
              
              <p className="text-xl font-bold text-purple-700">
                [Your Name]
              </p>
              
              <p className="text-gray-600">has successfully completed</p>
              
              <p className="text-lg font-semibold text-gray-900">
                {certificate.title || 'The Course'}
              </p>
              
              <div className="pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Star style={{ fontSize: 18, color: '#d97706' }} />
                  <span>Final Score: {certificate.finalScore?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CalendarToday style={{ fontSize: 18 }} />
                  <span>Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Verified style={{ fontSize: 18, color: '#10b981' }} />
                  <span>ID: {certificate.certificateId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Download />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
            
            <button
              onClick={() => {
                const verifyUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
                navigator.clipboard.writeText(verifyUrl);
                alert('Verification link copied to clipboard!');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              <Verified />
              Share
            </button>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg text-center">
            <p className="text-sm text-gray-600">
              🎓 Add this certificate to your LinkedIn profile to showcase your achievement!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // READY TO CLAIM STATE
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WorkspacePremium style={{ fontSize: 64, color: '#10b981' }} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            🌟 You're Ready! 🌟
          </h2>
          
          <p className="text-lg text-gray-700 mb-6">
            You've completed all requirements. Claim your certificate now!
          </p>

          <div className="bg-white rounded-xl p-6 mb-6 max-w-md mx-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle style={{ fontSize: 16, color: '#10b981' }} />
                </div>
                <span className="text-sm text-gray-700">✅ All lessons completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle style={{ fontSize: 16, color: '#10b981' }} />
                </div>
                <span className="text-sm text-gray-700">✅ All quizzes passed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle style={{ fontSize: 16, color: '#10b981' }} />
                </div>
                <span className="text-sm text-gray-700">✅ Final quiz passed</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : '🎓 Claim Your Certificate'}
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Click the button above to generate your official certificate
          </p>
        </div>
      </div>
    </div>
  );
}