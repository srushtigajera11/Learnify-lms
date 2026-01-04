import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

import { approveCourse } from "../services/adminApi";
import RejectCourseDialog from "./RejectCourseDialog";
import { useState } from "react";

const PendingCourses = ({ courses, refresh }) => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <Typography variant="h5" mb={2}>
        ⏳ Pending Approvals
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={4} key={course._id}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography fontWeight="bold">{course.title}</Typography>
                <Typography variant="body2">
                  {course.createdBy?.name}
                </Typography>

                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    await approveCourse(course._id);
                    refresh();
                  }}
                >
                  Approve
                </Button>

                <Button
                  fullWidth
                  sx={{ mt: 1 }}
                  variant="outlined"
                  color="error"
                  onClick={() => setSelected(course)}
                >
                  Reject
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selected && (
        <RejectCourseDialog
          course={selected}
          onClose={() => setSelected(null)}
          refresh={refresh}
        />
      )}
    </>
  );
};

export default PendingCourses;
