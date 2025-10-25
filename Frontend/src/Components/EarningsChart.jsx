import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CircularProgress, Box, Typography } from "@mui/material";
import axiosInstance from "../utils/axiosInstance"; // adjust import path if needed

const EarningsChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/analytics/tutor/monthly-earnings", {
          withCredentials: true,
        });

        // ✅ Backend returns: { success, formatted: [{ month, earnings }] }
        if (response.data.success && Array.isArray(response.data.formatted)) {
          setChartData(response.data.formatted);
        } else {
          setError("Invalid data format from server");
        }
      } catch (err) {
        console.error("Error fetching earnings chart data:", err);
        setError(err.response?.data?.message || "Failed to fetch chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (chartData.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 3 }}>
        No earnings data available yet.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "55vh",
        minWidth: "700px", // ✅ fixed minimum width for consistency
        overflowX: "auto", // scrolls horizontally if many months
        p: 1,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) => `₹${value.toLocaleString()}`} // ✅ Currency formatting
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`₹${value.toLocaleString()}`, "Earnings"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#6366f1" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default EarningsChart;
