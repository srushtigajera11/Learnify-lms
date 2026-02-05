import React from "react";
import EditProfileForm from "./EditProfileForm";

const TutorProfileView = ({ user }) => {
  const tutor = user.tutorProfile || {};

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LEFT */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="font-semibold text-indigo-600 mb-2">Instructor Stats</h3>
          <p>Courses: {tutor.totalCourses || 0}</p>
          <p>Students: {tutor.totalStudents || 0}</p>
          <p>Rating: {tutor.rating || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h3 className="font-semibold text-indigo-600 mb-2">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {(tutor.expertise || []).map(skill => (
              <span
                key={skill}
                className="px-3 py-1 text-xs border border-indigo-500 text-indigo-600 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="lg:col-span-2 bg-white rounded-xl border p-6">
        <EditProfileForm user={user} />
      </div>
    </div>
  );
};

export default TutorProfileView;
