import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../utils/axiosInstance";

const EarningsChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get(
          "/analytics/tutor/monthly-earnings"
        );

        if (response.data.success && Array.isArray(response.data.formatted)) {
          const cleaned = response.data.formatted.map((item) => ({
            month: item.month,
            earnings: Number(item.earnings) || 0,
          }));
          console.log("Chart Data:", cleaned);
          setChartData(cleaned);
        }
      } catch (err) {
        console.error("Chart fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[320px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex justify-center items-center h-[320px] text-gray-500">
        No earnings data available yet.
      </div>
    );
  }

  return (
    <div className="w-full h-[480px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis dataKey="month" />

          <YAxis
            tickFormatter={(v) => `₹${v.toLocaleString()}`}
          />

          <Tooltip
            formatter={(value) =>
              `₹${Number(value).toLocaleString()}`
            }
          />

          <Area
            type="monotone"
            dataKey="earnings"
            stroke="#4f46e5"
            strokeWidth={3}
            fill="url(#earningsGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EarningsChart;