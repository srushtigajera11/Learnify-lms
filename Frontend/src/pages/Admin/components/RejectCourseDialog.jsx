import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import { rejectCourse } from "../services/adminApi";

const RejectCourseDialog = ({ course, onClose, refresh }) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectCourse(course._id, feedback);
      refresh();       // Refresh dashboard data
      onClose();       // Close dialog
      setFeedback(""); // Reset feedback
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(course)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reject Course</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={1}>
          Provide feedback for the instructor explaining why the course is rejected.
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Explain why the course was rejected..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleReject}
          disabled={!feedback || loading}
        >
          {loading ? "Rejecting..." : "Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectCourseDialog;
