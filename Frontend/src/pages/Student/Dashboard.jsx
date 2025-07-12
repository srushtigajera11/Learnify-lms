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
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LaunchIcon from '@mui/icons-material/Launch';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../Components/Api/WishlistApi';


const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/students/courses');
      if (Array.isArray(res.data.courses)) {
        setCourses(res.data.courses);
      } else {
        setError('Invalid data format received from server');
      }

      // ✅ Fetch wishlist here:
      const wishlistData = await fetchWishlist();
      setWishlist(wishlistData.map((item) => item.courseId._id));  // store course IDs in wishlist state
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  fetchCourses();
}, []);


  const handleEnroll = async (courseId , coursePrice) => {
  try {
    const {data : keydata} = await axiosInstance.get('/payment/get-key');
    const razorpayKey = keydata.key;
    const {data : orderdata} = await axiosInstance.post(`/payment/create-order`, { amount: coursePrice });
    console.log("Order data:", orderdata);
     // Open Razorpay Checkout
      const options = {
        key: razorpayKey, // Replace with your Razorpay key_id
        amount: orderdata.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: 'INR',
        name: 'Leranify LMS',
        description: 'Test Transaction',
        order_id: orderdata.order.id, // This is the order_id created in the backend
        callback_url: 'http://localhost:3000/payment-success', // Your success URL
        prefill: {
          name: 'Srish j',
          email: 'srish.j@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    
  } catch (err) {
    alert(err.response?.data?.message || "Enrollment failed");
  }
};

if(loading){
  return(
    <Box sx={{display:'flex', justifyContent:'center', alignItems:'center',mt : 5}}>
      <CircularProgress />
    </Box>
  );
}
if (error) {
    return (
      <Alert severity="error" sx={{ mt: 5 }}>
        {error}
      </Alert>
    );
  }
  if(courses.length === 0){
    return(
      <Typography variant="h6" align="center" sx={{ mt: 5 }}>
        No courses available at the moment. Please check back later.
      </Typography>
    );
  }
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
  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Available Courses
        </Typography>
    <Grid container spacing={3} alignItems="stretch">
      {courses.map((course) => (
        <Grid item xs={12} sm={6} md={4} key={course._id}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image={course.thumbnail || '/default-thumbnail.jpg'}
              alt={course.title}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {course.description}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip label={`Lessons: ${course.totalLessons}`} />
                <Chip label={`CreatedBy: ${course.createdBy?.name}`} />
                <Chip label={`Price: ₹${course.price}`} />
              </Stack>
            </CardContent>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LaunchIcon />}
                onClick={() => handleEnroll(course._id, course.price)}
              >
                Enroll
              </Button>
              <Tooltip title={wishlist.includes(course._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                    <IconButton onClick={() => handleWishlistToggle(course._id)} color="error">
                      {wishlist.includes(course._id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
  </>
  );
};

export default Dashboard;
