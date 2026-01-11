import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  
} from "@mui/material";
import { 
  CheckCircle, 
  Pending, 
  Cancel,
  Edit,
  Visibility,
  VisibilityOff 
} from "@mui/icons-material";
import { updateCourseStatus } from "../services/adminApi";

const CourseList = ({ courses, refresh }) => {
  const handleStatusChange = async (id, status) => {
    await updateCourseStatus(id, status);
    refresh();
  };

  // Status configuration with colors and icons
  const statusConfig = {
    draft: { 
      label: "Draft", 
      color: "default", 
      icon: <Pending fontSize="small" /> 
    },
    pending: { 
      label: "Pending Review", 
      color: "warning", 
      icon: <Pending fontSize="small" /> 
    },
    published: { 
      label: "Published", 
      color: "success", 
      icon: <CheckCircle fontSize="small" /> 
    },
    rejected: { 
      label: "Rejected", 
      color: "error", 
      icon: <Cancel fontSize="small" /> 
    }
  };

  return (
    <>
      <Typography variant="h5" mb={2}>
        🎓 All Courses ({courses.length})
      </Typography>
      
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                boxShadow: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Course Title */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {course.title}
                </Typography>
                
                {/* Instructor */}
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Instructor: {course.createdBy?.name || "Unknown"}
                </Typography>
                
                {/* Price */}
                <Typography variant="body2" color="primary" fontWeight="medium" mb={1}>
                  Price: ${course.price || 0}
                </Typography>
                
                {/* Enrollments */}
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Enrollments: {course.enrollmentCount || 0}
                </Typography>

                {/* Current Status Display */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Current Status:
                  </Typography>
                  <Chip
                    icon={statusConfig[course.status]?.icon}
                    label={statusConfig[course.status]?.label || course.status}
                    color={statusConfig[course.status]?.color || "default"}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Status Change Dropdown */}
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Change Status:
                  </Typography>
                  <Select
                    value={course.status}
                    fullWidth
                    size="small"
                    onChange={(e) =>
                      handleStatusChange(course._id, e.target.value)
                    }
                    sx={{ mb: 1 }}
                  >
                    <MenuItem value="draft">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Pending fontSize="small" sx={{ mr: 1 }} />
                        Draft
                      </Box>
                    </MenuItem>
                    <MenuItem value="pending">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Pending fontSize="small" sx={{ mr: 1 }} />
                        Pending Review
                      </Box>
                    </MenuItem>
                    <MenuItem value="published">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                        Published
                      </Box>
                    </MenuItem>
                    <MenuItem value="rejected">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Cancel fontSize="small" sx={{ mr: 1 }} />
                        Rejected
                      </Box>
                    </MenuItem>
                  </Select>
                </Box>

                {/* Course ID & Date */}
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    ID: {course._id.substring(0, 8)}...
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Created: {new Date(course.createdAt).toLocaleDateString()}
                  </Typography>
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