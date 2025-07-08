import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  TextField,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Paper,
} from "@mui/material";

const Register = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    name: "",
    role: "student",
  });

  const { email, password, name, role } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleError = (err) =>
    toast.error(err, { position: "bottom-left" });

  const handleSuccess = (msg) =>
    toast.success(msg, { position: "bottom-right" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/users/register", inputValue);
      if (data.success) {
        handleSuccess(data.message || "Registration successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        handleError(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Signup error:", error);
      handleError(
        error.response?.data?.message || "Server error during registration"
      );
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
      {/* Left Form Side */}
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
            Create an Account
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={name}
              onChange={handleOnChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={handleOnChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={handleOnChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl margin="normal" fullWidth>
              <FormLabel sx={{ mb: 1 }}>Select Role</FormLabel>
              <RadioGroup
                row
                name="role"
                value={role}
                onChange={handleOnChange}
              >
                <FormControlLabel
                  value="student"
                  control={<Radio />}
                  label="Student"
                />
                <FormControlLabel
                  value="tutor"
                  control={<Radio />}
                  label="Tutor"
                />
              </RadioGroup>
            </FormControl>

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
              Register
            </Button>

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, color: "#555" }}
            >
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#1e3a8a", fontWeight: 500 }}>
                Login
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>

      {/* Right Image Side */}
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
          alt="Register Illustration"
          style={{ width: "90%", maxWidth: "500px", borderRadius: "20px" }}
        />
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default Register;
