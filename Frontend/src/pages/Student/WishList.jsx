import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { fetchWishlist, removeFromWishlist } from '../../Components/Api/WishlistApi';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchWishlist();
        setWishlist(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemove = async (courseId) => {
    try {
      await removeFromWishlist(courseId);
      setWishlist((prev) => prev.filter((item) => item.courseId._id !== courseId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
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

  if (wishlist.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Your wishlist is empty.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fc', minHeight: 'calc(100vh - 64px)' }}>
      <Typography variant="h4" gutterBottom>
        My Wishlist
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 3,
          mt: 2,
        }}
      >
        {wishlist.map((item) => {
          const course = item.courseId;
          return (
            <Card
              key={course._id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
            >
              <Box sx={{ height: 160, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={course.thumbnail || '/default-thumbnail.jpg'}
                  alt={course.title}
                  sx={{ width: '100%', objectFit: 'cover' }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  noWrap
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  {course.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {course.description}
                </Typography>
              </CardContent>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                }}
              >
                <Tooltip title="Remove from Wishlist">
                  <IconButton onClick={() => handleRemove(course._id)} color="error">
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" color="textSecondary">
                  By {course.createdBy?.name || 'Unknown'}
                </Typography>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default Wishlist;
