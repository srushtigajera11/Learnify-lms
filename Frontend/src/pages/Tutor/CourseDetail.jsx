import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button
} from '@mui/material';

export default function CourseDetail() {
  const { courseId } = useParams();
  console.log("Course ID:", courseId);
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Course</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-xl">Edit Course</h3>
          <Button onClick={() => navigate(`/tutor/course/${courseId}/edit`)}>Edit Course Info</Button>
        </div>
        <div className="card">
          <h3 className="text-xl">Lessons</h3>
          <Button onClick={() => navigate(`/tutor/course/${courseId}/lessons`)}>View Lessons</Button>
          <Button className="mt-2" onClick={() => navigate(`/tutor/course/${courseId}/lessons/add`)}>Add Lesson</Button>
        </div>
      </div>
    </div>
  );
}

