import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)",
        position: "relative",
        px: 4,
      }}
    >
      {/* Logo */}
      <Box sx={{ position: "absolute", top: 2, left: 32 }}>
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{ width: "100px", height: "150px", objectFit: "contain" }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: { xs: 4, md: 10 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        {/* Left Text */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: "#1e3a8a",
              fontSize: { xs: "2.2rem", md: "3.5rem" },
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            Welcome to <br /> Our Learning Platform
          </Typography>

          <Typography
            sx={{
              fontSize: "1.1rem",
              color: "#374151",
              maxWidth: "500px",
              mb: 4,
            }}
          >
            Empowering students and tutors to connect, learn, and grow together.
            Join Learnify to accelerate your journey today!
          </Typography>

          <Button
            onClick={() => navigate("/register")}
            sx={{
              background: "linear-gradient(to right, #4f46e5, #3b82f6)",
              color: "#fff",
              px: 5,
              py: 1.5,
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 8px 20px rgba(59,130,246,0.3)",
              "&:hover": {
                background: "linear-gradient(to right, #4338ca, #2563eb)",
              },
            }}
          >
            🚀 Get Started
          </Button>
        </Box>

        {/* Right Image Card */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              backdropFilter: "blur(8px)",
              background: "rgba(255,255,255,0.6)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
              maxWidth: "500px",
              width: "100%",
            }}
          >
            <img
              src="/images/landing.jpg"
              alt="Illustration"
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
