// frontend/src/pages/admin/pages/CourseList.jsx - UPDATED
import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Button
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Cancel,
  Search,
  FilterList,
  Download,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import { updateCourseStatus } from "../services/adminApi";

const CourseList = ({ courses, refresh }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleStatusChange = async (id, status) => {
    await updateCourseStatus(id, status);
    refresh();
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.createdBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status configuration
  const statusConfig = {
    draft: { label: "Draft", color: "default", icon: <VisibilityOff fontSize="small" /> },
    pending: { label: "Pending", color: "warning", icon: <Pending fontSize="small" /> },
    published: { label: "Published", color: "success", icon: <CheckCircle fontSize="small" /> },
    rejected: { label: "Rejected", color: "error", icon: <Cancel fontSize="small" /> }
  };

  return (
    <>
      {/* Header with Search & Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          📚 All Courses ({filteredCourses.length})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Search */}
          <TextField
            placeholder="Search courses..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          
          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Courses Grid */}
      <Grid container spacing={3}>
        {filteredCourses.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No courses found
              </Typography>
            </Card>
          </Grid>
        ) : (
          filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  {/* Course Title */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                    {course.title}
                  </Typography>
                  
                  {/* Instructor & Price */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By: {course.createdBy?.name || course.instructor?.name || "Unknown"}
                  </Typography>
                  
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    Price: ₹{course.price || 0}
                  </Typography>
                  
                  {/* Current Status Display */}
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Chip
                      icon={statusConfig[course.status]?.icon}
                      label={statusConfig[course.status]?.label || course.status}
                      color={statusConfig[course.status]?.color}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Enrollments: {course.enrollmentCount || 0}
                    </Typography>
                  </Box>

                  {/* Status Change Dropdown */}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Change Status:
                    </Typography>
                    <Select
                      value={course.status}
                      fullWidth
                      size="small"
                      onChange={(e) => handleStatusChange(course._id, e.target.value)}
                    >
                      <MenuItem value="draft">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VisibilityOff fontSize="small" />
                          Draft
                        </Box>
                      </MenuItem>
                      <MenuItem value="pending">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Pending fontSize="small" />
                          Pending Review
                        </Box>
                      </MenuItem>
                      <MenuItem value="published">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle fontSize="small" />
                          Published
                        </Box>
                      </MenuItem>
                      <MenuItem value="rejected">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Cancel fontSize="small" />
                          Rejected
                        </Box>
                      </MenuItem>
                    </Select>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
};

export default CourseList;