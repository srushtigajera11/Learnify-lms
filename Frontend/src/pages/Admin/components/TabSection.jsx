// /admin/components/FuturisticTabSection.jsx
import React from "react";
import {
  Tabs as MUITabs,
  Tab,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from "@mui/material";

const TabSection = ({ tab, setTab, enrollments, payments }) => {
  return (
    <Box>
      {/* Tabs Header */}
      <MUITabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="📘 Enrollments" />
        <Tab label="💳 Payments" />
      </MUITabs>

      {/* Tab Content */}
      {tab === 0 && (
        <Box sx={{ display: "grid", gap: 2 }}>
          {enrollments.map((enroll) => (
            <Card
              key={enroll._id}
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
              }}
            >
              <CardContent>
                <Typography fontWeight="bold">
                  {enroll.studentId?.name || "Deleted User"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {enroll.studentId?.email || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Course: {enroll.courseId?.title || "Deleted Course"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enrolled on: {new Date(enroll.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {enrollments.length === 0 && (
            <Typography align="center" color="text.secondary" mt={2}>
              No enrollments available.
            </Typography>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: "grid", gap: 2 }}>
          {payments.map((payment) => (
            <Card
              key={payment._id}
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight="bold">
                    {payment.userId?.name || "Deleted User"}
                  </Typography>
                  <Chip
                    label={payment.status || "Pending"}
                    color={
                      payment.status === "success"
                        ? "success"
                        : payment.status === "failed"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {payment.userId?.email || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Course: {payment.courseId?.title || "Deleted Course"}
                </Typography>
                <Typography variant="body2">Amount: ₹{payment.amount}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Paid on: {new Date(payment.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {payments.length === 0 && (
            <Typography align="center" color="text.secondary" mt={2}>
              No payments available.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TabSection;
