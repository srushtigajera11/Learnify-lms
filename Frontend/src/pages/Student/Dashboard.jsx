import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
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
      <div className="flex justify-center mt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mt-20 mx-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 bg-gray-50 min-h-screen">
      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Main content area - 2/3 width on large screens */}
        <div className="lg:col-span-2 xl:col-span-3">
          {/* Recommended Courses Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recommended for You
            </h2>
            
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">
                  No courses available at the moment. Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-48">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                      
                      {/* Trending Badge */}
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        🔥 Trending
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {course.description}
                      </p>
                      
                      {/* Course Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Lessons: {course.totalLessons}
                        </span>
                        {course.createdBy?.name && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            By: {course.createdBy.name}
                          </span>
                        )}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          ₹{course.price}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                      {course.isEnrolled ? (
                        <button
                          onClick={() => navigate(`/student/course/${course._id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700  text-white rounded-lg font-medium transition"
                        >
                          Learn More
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course._id, course.price)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                        >
                          <LaunchIcon className="h-5 w-5" />
                          Enroll
                        </button>
                      )}

                      
                      {!course.isEnrolled && (
                        <button
                          onClick={() => handleWishlistToggle(course._id)}
                          className="p-2 text-red-500 hover:text-red-600 transition"
                        >
                          {wishlist.includes(course._id) ? (
                            <FavoriteIcon className="h-6 w-6" />
                          ) : (
                            <FavoriteBorderIcon className="h-6 w-6" />
                          )}
                        </button>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 width on large screens */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <StudentDashboardRightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;