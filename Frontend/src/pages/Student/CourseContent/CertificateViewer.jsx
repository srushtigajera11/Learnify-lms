import React, { useState, useEffect } from 'react';
import {
  WorkspacePremium,
  Download,
  Verified,
  EmojiEvents,
  Star,
  CalendarToday,
  CheckCircle,
  Lock,
  Share
} from '@mui/icons-material';
import axiosInstance from '../../../utils/axiosInstance';

export default function CertificateViewer({ courseId, certificate, isLocked, onClaim }) {
  const [claiming,    setClaiming]    = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [copied,      setCopied]      = useState(false);

  // Fetch the logged-in student's name for the certificate preview
  useEffect(() => {
    axiosInstance.get('/auth/me')
      .then(res => setStudentName(res.data?.user?.name || res.data?.name || ''))
      .catch(() => {});
  }, []);

  const handleClaim = async () => {
    if (isLocked || certificate || claiming) return;
    try {
      setClaiming(true);
      const res = await axiosInstance.post(`/certificates/claim/${courseId}`);
      if (res.data.success && onClaim) onClaim(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim certificate. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate?.certificateId || downloading) return;
    try {
      setDownloading(true);
      const res = await axiosInstance.get(
        `/certificates/download/${certificate.certificateId}`,
        { responseType: 'blob' }
      );
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `${certificate.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── LOCKED ──────────────────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 shadow-sm">
          {/* Decorative top stripe */}
          <div className="h-1.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />

          <div className="p-10 text-center">
            {/* Lock icon */}
            <div className="relative inline-flex mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Lock style={{ fontSize: 36, color: '#9ca3af' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                <WorkspacePremium style={{ fontSize: 14, color: '#6b7280' }} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate Locked</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Complete all the requirements below to unlock your certificate
            </p>

            {/* Requirements */}
            <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3">
              {[
                'Complete all lessons',
                'Pass all quizzes',
                'Pass the final quiz'
              ].map((req, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                  <span className="text-sm text-gray-600">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ALREADY CLAIMED ──────────────────────────────────────────────────────────
  if (certificate) {
    const issuedDate = certificate.issuedAt
      ? new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Success header */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <WorkspacePremium style={{ fontSize: 36, color: 'white' }} />
          </div>
          <h2 className="text-2xl font-bold mb-1">🎉 Congratulations!</h2>
          <p className="text-violet-200 text-sm">You've earned your certificate</p>
        </div>

        {/* Certificate card */}
        <div className="bg-white rounded-3xl border-2 border-violet-100 shadow-lg overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

          <div className="p-8">
            {/* Trophy */}
            <div className="text-center mb-6">
              <EmojiEvents style={{ fontSize: 40, color: '#d97706' }} />
            </div>

            {/* Certificate text */}
            <div className="text-center space-y-2 mb-6">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Certificate of Completion
              </p>
              <div className="w-16 h-px bg-violet-200 mx-auto" />
              <p className="text-sm text-gray-500">This certifies that</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentName || certificate.studentName || 'Student'}
              </p>
              <p className="text-sm text-gray-500">has successfully completed</p>
              <p className="text-lg font-semibold text-violet-700">
                {certificate.title?.replace('Certificate of Completion - ', '') || 'The Course'}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <Star style={{ fontSize: 18, color: '#d97706' }} />
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {certificate.finalScore?.toFixed(0)}%
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Score</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-3 text-center">
                <CalendarToday style={{ fontSize: 18, color: '#7c3aed' }} />
                <p className="text-xs font-semibold text-gray-900 mt-1 leading-tight">{issuedDate}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Issued</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <Verified style={{ fontSize: 18, color: '#10b981' }} />
                <p className="text-[10px] font-mono font-bold text-gray-700 mt-1 break-all leading-tight">
                  {certificate.certificateId?.slice(-8)}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Cert ID</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                <Download fontSize="small" />
                {downloading ? 'Downloading…' : 'Download PDF'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                <Share fontSize="small" />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* LinkedIn tip */}
        <p className="text-center text-xs text-gray-400">
          🎓 Add this to your LinkedIn profile to showcase your achievement
        </p>
      </div>
    );
  }

  // ── READY TO CLAIM ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />

        <div className="p-10 text-center">
          {/* Animated icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
              <WorkspacePremium style={{ fontSize: 40, color: '#10b981' }} />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
              <Star style={{ fontSize: 14, color: 'white' }} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're ready! 🌟</h2>
          <p className="text-gray-500 text-sm mb-8">
            All requirements completed. Claim your certificate now.
          </p>

          {/* Completed requirements */}
          <div className="bg-emerald-50 rounded-2xl p-6 text-left space-y-3 mb-8">
            {[
              'All lessons completed',
              'All quizzes passed',
              'Final quiz passed'
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle style={{ fontSize: 14, color: 'white' }} />
                </div>
                <span className="text-sm text-gray-700 font-medium">{req}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-bold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {claiming ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating certificate…
              </span>
            ) : (
              '🎓 Claim Your Certificate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}