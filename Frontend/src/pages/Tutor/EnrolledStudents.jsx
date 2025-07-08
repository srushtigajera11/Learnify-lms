// src/pages/tutor/EnrolledStudents.jsx

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const EnrolledStudents = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [groupedEnrollments, setGroupedEnrollments] = useState({});
  const [selectedCourse, setSelectedCourse] = useState("All");

  // Group enrollments by course title
  const groupByCourse = (data) => {
    const grouped = {};
    data.forEach((enroll) => {
      const courseTitle = enroll.courseId?.title || "Untitled Course";
      if (!grouped[courseTitle]) {
        grouped[courseTitle] = [];
      }
      grouped[courseTitle].push(enroll);
    });
    return grouped;
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axiosInstance.get("/analytics/tutor/enrollments", {
          withCredentials: true,
        });
        const data = response.data.enrollments || [];
        setEnrollments(data);
        setGroupedEnrollments(groupByCourse(data));
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Enrolled Students
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {Object.keys(groupedEnrollments).length > 1 && (
            <FormControl sx={{ mb: 3, minWidth: 200 }}>
              <InputLabel id="course-filter-label">Filter by Course</InputLabel>
              <Select
                labelId="course-filter-label"
                value={selectedCourse}
                label="Filter by Course"
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {Object.keys(groupedEnrollments).map((title, idx) => (
                  <MenuItem key={idx} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {Object.entries(groupedEnrollments)
            .filter(([title]) => selectedCourse === "All" || selectedCourse === title)
            .map(([courseTitle, courseEnrollments], idx) => {
              const course = courseEnrollments[0].courseId;

              return (
                <Paper
                  elevation={3}
                  sx={{
                    mb: 4,
                    p: 2,
                    borderLeft: "6px solid #1976d2",
                    backgroundColor: "#f9f9f9",
                  }}
                  key={idx}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    {course?.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt="Course Thumbnail"
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 8,
                          marginRight: 16,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <Box>
                      <Typography variant="h6">
                        📘 {course?.title || courseTitle}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {courseEnrollments.length} student(s) enrolled
                      </Typography>
                    </Box>
                  </Box>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Enrolled On</TableCell>
                        <TableCell>Payment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseEnrollments.map((enroll, index) => (
                        <TableRow key={enroll._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{enroll.studentId?.name || "N/A"}</TableCell>
                          <TableCell>{enroll.studentId?.email || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(enroll.enrolledAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>N/A</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              );
            })}
        </>
      )}
    </Box>
  );
};

export default EnrolledStudents;
