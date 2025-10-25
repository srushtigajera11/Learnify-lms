import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  LinearProgress,
  Grid,
  Stack,
} from '@mui/material';

const PurchaseHistory = () => {
  const [tab, setTab] = useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: enrollmentRes } = await axiosInstance.get('/history/enrollments');
        const { data: paymentRes } = await axiosInstance.get('/history/payments');

        setEnrollments(enrollmentRes.enrollments);
        setPayments(paymentRes.payments);
      } catch (err) {
        console.error('History fetch error:', err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Box p={3} maxWidth="1000px" mx="auto">
      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} centered>
        <Tab label="My Enrollments" />
        <Tab label="Payment History" />
      </Tabs>

      {/* === Enrollments === */}
      {tab === 0 && (
        <Box mt={3}>
          {enrollments.length > 0 ? (
            enrollments.map((item) => (
              <Card key={item._id} sx={{ display: 'flex', mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardMedia
                  component="img"
                  image={item.course.thumbnail}
                  alt={item.course.title}
                  sx={{ width: 160, height: 120 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography variant="h6">{item.course.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Instructor: {item.course.createdBy?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enrolled on: {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={2} mt={2}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={item.progress || 0}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body2">{item.progress || 0}%</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" mt={2}>
                      <Chip label={item.status || 'In Progress'} color="primary" />
                      <Button
                        variant="contained"
                        href={`/student/course/${item.course._id}`}
                        size="small"
                      >
                        Go to Course
                      </Button>
                    </Stack>
                  </CardContent>
                </Box>
              </Card>
            ))
          ) : (
            <Typography>No enrollments found.</Typography>
          )}
        </Box>
      )}

      {/* === Payments === */}
      {tab === 1 && (
        <Box mt={3}>
          {payments.length > 0 ? (
            payments.map((item) => (
              <Card key={item._id} sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6">{item.course.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: ₹{item.amount / 100}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(item.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status:{' '}
                  <Chip
                    label={item.status}
                    color={item.status === 'success' ? 'success' : 'error'}
                    size="small"
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Payment ID: {item.razorpayPaymentId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order ID: {item.razorpayOrderId}
                </Typography>
              </Card>
            ))
          ) : (
            <Typography>No payment history found.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PurchaseHistory;
