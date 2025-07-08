// src/components/EarningsChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, Typography,CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from '../utils/axiosInstance'; // Adjust the import based on your project structure

const EarningsChart = () => {
  const [data, setData] = useState([]);
  const [loading , setLoading] = useState(true);
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get("/analytics/tutor/monthly-earnings", {
          withCredentials: true,
        });
        if(Array.isArray(response.data.formatted)){
          setData(response.data.formatted);
        }else{
          console.error("Unexpected data format:", response.data);
          setData([]);
        }

      } catch (error) {
        console.error("Error fetching earnings data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);
  return (
    <Card sx={{ mt: 4, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Monthly Earnings
        </Typography>
        {loading ?(<CircularProgress />) :(
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#1976d2"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        ) }
        
      </CardContent>
    </Card>
  );
};

export default EarningsChart;
