import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import ProfileHeader from "./ProfileHeader";
import StudentProfileView from "./StudentProfileView";
import TutorProfileView from "./TutorProfileView";

const ProfileLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get("/users/profile");
        setUser(data.user);
      } catch (err) {
        console.error("Profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-red-500">Failed to load profile</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader user={user} />

      {user.role === "student" && <StudentProfileView user={user} />}
      {user.role === "tutor" && <TutorProfileView user={user} />}
    </div>
  );
};

export default ProfileLayout;
