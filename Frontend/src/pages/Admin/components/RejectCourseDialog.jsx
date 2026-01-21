import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
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
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Reject Course</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">
            Why are you rejecting "{course.title}"?
          </p>
          
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide feedback..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-h-[100px]"
            disabled={loading}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={!feedback || loading}
            className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 rounded-lg"
          >
            {loading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectCourseDialog;