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

const EnrollmentTable = ({ rows }) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Enrolled On</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((enroll) => (
            <TableRow key={enroll._id}>
              <TableCell>{enroll.studentId?.name}</TableCell>
              <TableCell>{enroll.studentId?.email}</TableCell>
              <TableCell>{enroll.courseId?.title}</TableCell>
              <TableCell>
                {new Date(enroll.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EnrollmentTable;
