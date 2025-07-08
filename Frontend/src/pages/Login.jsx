import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../Context/authContext"; // 👈 import here
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
} from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login: setUser } = useAuth();

  const handleError = (err) =>
    toast.error(err, { position: "bottom-left" });

  const handleSuccess = (msg) =>
    toast.success(msg, { position: "bottom-left" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/users/login", {
        email: email.trim(),
        password,
      });

      if (data && data.user) {
        const role = data.user.role.toLowerCase();
        const isAdmin = data.user.isAdmin;

        handleSuccess(data.message || "Login successful!");

        setUser({ // 👈 store user in context
          user_id: data.user.user_id,
          role,
          isAdmin,
        });
        
       if (isAdmin) {
          navigate("/admin/dashboard");
        } else if (role === "student") {
          navigate("/student/dashboard");
        } else if (role === "tutor") {
          navigate("/tutor/dashboard");
        } else {
  handleError("Unknown user role");
        }
      } else {
        handleError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      handleError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(to right, #e3f2fd, #fce4ec)",
      }}
    >
      {/* Left Side: Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255,255,255,0.7)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ color: "#1e3a8a", fontWeight: 600 }}
          >
            Log in
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                background: "linear-gradient(to right, #4f46e5, #3b82f6)",
                fontWeight: "bold",
                py: 1.3,
                fontSize: "1rem",
                borderRadius: "12px",
                "&:hover": {
                  background: "linear-gradient(to right, #4338ca, #2563eb)",
                },
              }}
            >
              Log In
            </Button>

            {/* Forgot Password */}
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "#666", textAlign: "center" }}
            >
              Don’t have an account?{" "}
              <Link to="/register" style={{ color: "#1e3a8a", fontWeight: 500 }}>
                Sign Up
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>

      {/* Right Side: Image */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f3f4f6",
        }}
      >
        <img
          src="/images/login.png"
          alt="Login Illustration"
          style={{ width: "90%", maxWidth: "500px", borderRadius: "20px" }}
        />
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default Login;
