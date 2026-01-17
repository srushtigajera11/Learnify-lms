import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="min-h-screen flex bg-gradient-to-r from-blue-50 to-pink-50">
      {/* Left Form Side */}
      <div className="flex-1 flex justify-center items-center px-2">
        <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-sm bg-white/70 shadow-xl">
          <h1 className="text-2xl font-bold text-blue-900 text-center mb-2">
            Create an Account
          </h1>
          
          <p className="text-gray-600 text-center mb-6">
            Join our learning community
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleOnChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4 relative">
              
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Role
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={handleOnChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="tutor"
                    checked={role === "tutor"}
                    onChange={handleOnChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Tutor</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg mb-4"
            >
              Register
            </button>

            <p className="text-center text-gray-600 mt-2">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-blue-900 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="flex-1 flex justify-center items-center bg-gray-100">
        <img
          src="/images/login.png"
          alt="Register Illustration"
          className="w-11/12 max-w-lg rounded-2xl"
        />
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;