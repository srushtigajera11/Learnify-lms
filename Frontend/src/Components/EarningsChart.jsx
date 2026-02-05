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
      <div className="flex justify-center items-center h-[40vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-12 py-4">
        No earnings data available yet.
      </div>
    );
  }

  return (
    <div
      className="w-full h-[55vh] min-w-[700px] overflow-x-auto p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip
            formatter={(value) => [`₹${value.toLocaleString()}`, "Earnings"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
            }}
            labelStyle={{
              color: "#374151",
              fontWeight: "600",
            }}
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ 
              r: 4, 
              fill: "#6366f1",
              stroke: "#ffffff",
              strokeWidth: 2
            }}
            activeDot={{ 
              r: 6, 
              fill: "#4f46e5",
              stroke: "#ffffff",
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EarningsChart;