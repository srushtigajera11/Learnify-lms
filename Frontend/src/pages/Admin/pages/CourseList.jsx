import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import { CheckCircle, Pending } from "@mui/icons-material";
import { updateCourseStatus } from "../services/adminApi";

const CourseList = ({ courses, refresh }) => {
  const handleStatusChange = async (id, status) => {
    await updateCourseStatus(id, status);
    refresh();
  };

  return (
    <>
      <Typography variant="h5" mb={2}>
        🎓 All Courses
      </Typography>
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={4} key={course._id}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography fontWeight="bold">{course.title}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Created by: {course.createdBy?.name || "Unknown"}
                </Typography>

                <Box mt={2}>
                  <Typography variant="body2">Status</Typography>
                  <Select
                    value={course.status}
                    fullWidth
                    size="small"
                    onChange={(e) =>
                      handleStatusChange(course._id, e.target.value)
                    }
                  >
                    <MenuItem value="draft">
                      <Pending fontSize="small" sx={{ mr: 1 }} />
                      Draft
                    </MenuItem>
                    <MenuItem value="published">
                      <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                      Published
                    </MenuItem>
                  </Select>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CourseList;
