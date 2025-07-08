// src/pages/tutor/Earnings.jsx

import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
   const fetchEarnings = async () => {
  try {
    const res = await axiosInstance.get("/analytics/tutor/earnings", {
      withCredentials: true,
    });

    console.log("Earnings data:", res.data);

    const earningsList = res.data.earningsList || [];
    const total = res.data.totalEarnings || 0;

    setTotalEarnings(total);
    setSummary(earningsList);
  } catch (err) {
    console.error("Failed to fetch earnings:", err);
  } finally {
    setLoading(false);
  }
};


    fetchEarnings();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Earnings Overview
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* 💰 Total Earnings Card */}
          <Card sx={{ mb: 4, backgroundColor: "#e3f2fd" }}>
            <CardContent>
              <Typography variant="h6">Total Earnings</Typography>
              <Typography variant="h4" fontWeight="bold">
                ₹{totalEarnings.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>

          {/* 📊 Earnings Table */}
          <Paper elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Students Enrolled</TableCell>
                  <TableCell>Course Price</TableCell>
                  <TableCell>Total Earned</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                 {summary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No earnings data available.
                  </TableCell>
                </TableRow>
              ) : (
                summary.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.courseTitle}</TableCell>
                    <TableCell>{item.students}</TableCell>
                    <TableCell>₹{(item.totalEarnings / item.students).toFixed(2)}</TableCell>
                    <TableCell>₹{item.totalEarnings.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}

              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Earnings;
