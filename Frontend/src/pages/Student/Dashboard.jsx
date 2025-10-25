import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  Typography,
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
  LinearProgress,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LaunchIcon from "@mui/icons-material/Launch";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "../../Components/Api/WishlistApi";
import StudentDashboardRightSidebar from "./StudentDashboardRightSide";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  // Dummy data for Continue Learning (kept as fallback)
  const continueLearningCourse = {
    _id: "dummyCourse123",
    title: "Communication : lessons for Better interaction",
    instructor: { name: "NIA" },
    thumbnail:
      "data:image/jpeg;base64,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",
    progress: 75,
    enrolledDate: "2/8/2025",
  };

  useEffect(() => {
    const fetchCoursesAndWishlist = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/students/courses");
        if (Array.isArray(res.data.courses)) {
          setCourses(res.data.courses);
        } else {
          setError("Invalid data format received from server");
        }
        const wishlistData = await fetchWishlist();
        setWishlist(wishlistData.map((item) => item.courseId._id));
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndWishlist();
  }, []);

  const handleEnroll = async (courseId, coursePrice) => {
    try {
      const { data: keydata } = await axiosInstance.get("/payment/get-key");
      const razorpayKey = keydata.key;

      const { data: orderdata } = await axiosInstance.post(
        "/payment/create-order",
        { amount: coursePrice }
      );

      const options = {
        key: razorpayKey,
        amount: orderdata.order.amount,
        currency: "INR",
        name: "Learnify LMS",
        description: "Course Enrollment",
        order_id: orderdata.order.id,
        prefill: {
          name: "Srish J",
          email: "srish.j@example.com",
          contact: "9999999999",
        },
        theme: { color: "#6557feff" },
        handler: async function (response) {
          const verificationData = {
            courseId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: orderdata.order.amount,
            currency: "INR",
          };
          try {
            await axiosInstance.post("/payment/verify-enroll", verificationData);
            alert("Enrollment successful!");
            navigate(`/student/course/${courseId}`);
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verified, but enrollment failed");
          }
        },
        modal: { ondismiss: () => console.log("Payment popup closed") },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

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
      console.error("Wishlist error:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
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

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: "#f9fafb" }}>
      {/* Use CSS Grid so we precisely control the column gap + fixed sidebar width */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 360px" }, // fixed sidebar width on md+
          gap: { xs: 2, md: 4 }, // controls horizontal + vertical gap consistently
          alignItems: "start",
        }}
      >
        {/* ---------- MAIN CONTENT (left column) ---------- */}
        <Box>
          {/* Continue Learning - Conditional */}
          {continueLearningCourse && (
            <Box mb={5}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Continue Learning
              </Typography>
              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 2,
                  boxShadow: 2,
                  p: 2,
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: 160,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 2,
                  }}
                  image={continueLearningCourse.thumbnail}
                  alt={continueLearningCourse.title}
                />
                <CardContent
                  sx={{
                    flex: "1 0 auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    pl: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom noWrap>
                      {continueLearningCourse.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Instructor: {continueLearningCourse.instructor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enrolled on: {continueLearningCourse.enrolledDate}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={continueLearningCourse.progress}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": { bgcolor: "#6366f1" },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {continueLearningCourse.progress}%
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: "#6366f1",
                          "&:hover": { bgcolor: "#5149d6" },
                          textTransform: "none",
                          fontWeight: "bold",
                        }}
                        onClick={() =>
                          navigate(`/student/course/${continueLearningCourse._id}`)
                        }
                      >
                        Go to Course
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Recommended Courses */}
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Recommended for You
            </Typography>
            {courses.length === 0 ? (
              <Typography variant="h6" align="center" sx={{ mt: 5 }}>
                No courses available at the moment. Please check back later.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 3,
                }}
              >
                {courses.map((course) => (
                  <Card
                    key={course._id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRadius: 2,
                      boxShadow: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ height: 150, position: "relative" }}>
                      {course.thumbnail ? (
                        <CardMedia
                          component="img"
                          image={course.thumbnail}
                          alt={course.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#f5f5f5",
                            color: "#888",
                            fontSize: 18,
                          }}
                        >
                          No Image
                        </Box>
                      )}

                      {/* Optional Trending Tag */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          bgcolor: "#ef4444",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        🔥 Trending
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                        noWrap
                      >
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 40,
                        }}
                      >
                        {course.description}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                        <Chip label={`Lessons: ${course.totalLessons}`} size="small" />
                        {course.createdBy?.name && (
                          <Chip label={`By: ${course.createdBy.name}`} size="small" />
                        )}
                        <Chip
                          label={`₹${course.price}`}
                          size="small"
                          color="primary"
                        />
                      </Stack>
                    </CardContent>

                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: "#6366f1",
                          "&:hover": { bgcolor: "#5149d6" },
                          textTransform: "none",
                          fontWeight: "bold",
                        }}
                        startIcon={<LaunchIcon />}
                        onClick={() => handleEnroll(course._id, course.price)}
                      >
                        Enroll
                      </Button>
                      <Tooltip
                        title={
                          wishlist.includes(course._id)
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                      >
                        <IconButton
                          onClick={() => handleWishlistToggle(course._id)}
                          color="error"
                        >
                          {wishlist.includes(course._id) ? (
                            <FavoriteIcon />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* ---------- SIDEBAR (right column) ---------- */}
        <Box>
          {/* Make sidebar sticky on md+ so its cards don't jump and spacing stays consistent */}
          <Box
            sx={{
              position: { xs: "static", md: "sticky" },
              top: { md: 96 }, // adjust if your navbar/banner height differs
              // set a max width so the internal cards align neatly
              width: "100%",
              maxWidth: "360px",
            }}
          >
            <StudentDashboardRightSidebar />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
