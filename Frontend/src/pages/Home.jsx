import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 relative px-4 py-12">
      {/* Logo */}
      <div className="absolute top-4 left-8 z-10">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="w-24 h-36 object-contain"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-between max-w-6xl w-full">
        {/* Left Text */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-6 leading-tight">
            Welcome to <br /> Our Learning Platform
          </h1>

          <p className="text-lg text-gray-700 max-w-xl mb-8">
            Empowering students and tutors to connect, learn, and grow together.
            Join Learnify to accelerate your journey today!
          </p>

          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
          >
            🚀 Get Started
          </button>
        </div>

        {/* Right Image Card */}
        <div className="flex-1 flex justify-center items-center">
          <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-6 shadow-2xl shadow-gray-200/50 max-w-lg w-full border border-white/30">
            <img
              src="/images/landing.jpg"
              alt="Learning Illustration"
              className="w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;