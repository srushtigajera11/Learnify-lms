import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../Components/Api/WishlistApi';

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await axiosInstance.get('/students/ecourses');
        const wishlistData = await fetchWishlist();
        if (Array.isArray(coursesResponse.data.enrollments)) {
          setEnrolledCourses(coursesResponse.data.enrollments);
          setWishlist(wishlistData.map((item) => item.courseId._id));
        } else {
          setError('Invalid data format received from server');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWishlistToggle = async (courseId) => {
    try {
      if (wishlist.includes(courseId)) {
        await removeFromWishlist(courseId);
        setWishlist((prev) => prev.filter((id) => id !== courseId));
      } else {
        await addToWishlist(courseId);
        setWishlist((prev) => [...prev, courseId]);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (enrolledCourses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" align="center">
          You are not enrolled in any courses. Please check back later.
        </Typography>
      </Box>
    );
  }


  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fc', minHeight: 'calc(100vh - 64px)' }}>
      <Typography variant="h4" gutterBottom>
        Enrolled Courses
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        {enrolledCourses.map((course) => {
          const courseData = course.courseId;
          return (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={courseData.thumbnail || '/default-thumbnail.jpg'}
                  alt={courseData.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {courseData.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {courseData.description.substring(0, 80)}...
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                  <Tooltip title={wishlist.includes(courseData._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                    <IconButton onClick={() => handleWishlistToggle(courseData._id)} color="error">
                      {wishlist.includes(courseData._id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Button variant="contained" color="primary" onClick={() => navigate(`/student/course/${courseData._id}`)}>
                    View Course
                  </Button>
                  <Typography variant="body2" color="textSecondary">
                    By {course.courseId.createdBy?.name || 'Unknown'}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EnrolledCourses;
