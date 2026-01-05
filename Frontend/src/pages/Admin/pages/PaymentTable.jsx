import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const PaymentTable = ({ rows }) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((payment) => (
            <TableRow key={payment._id}>
              <TableCell>{payment.userId?.name}</TableCell>
              <TableCell>{payment.userId?.email}</TableCell>
              <TableCell>{payment.courseId?.title}</TableCell>
              <TableCell>₹{payment.amount}</TableCell>
              <TableCell>{payment.status}</TableCell>
              <TableCell>
                {new Date(payment.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentTable;
