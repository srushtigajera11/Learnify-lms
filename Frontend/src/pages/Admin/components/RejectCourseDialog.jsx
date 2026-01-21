import React, { useState } from "react";
import { X } from "lucide-react";
import { rejectCourse } from "../services/adminApi";

const RejectCourseDialog = ({ course, onClose, refresh }) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectCourse(course._id, feedback);
      if (refresh) refresh();
      onClose();
      setFeedback("");
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      
      {/* Minimal Dialog */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">Reject Course</h3>
          <p className="text-sm text-gray-500 mt-1">Provide feedback for rejection</p>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Course: <span className="font-normal">{course.title}</span>
            </div>
          </div>
          
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter rejection feedback..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-h-[80px] resize-none"
            disabled={loading}
            autoFocus
          />
          
          <div className="text-xs text-gray-400 mt-2">
            This feedback will be sent to the instructor.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={!feedback.trim() || loading}
            className="px-3 py-2 text-sm bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {loading ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectCourseDialog;