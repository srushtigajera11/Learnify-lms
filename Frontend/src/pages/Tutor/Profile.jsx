import { useState } from "react";
import EditProfileForm from "../../Components/EditProfileForm";
import UpdatePasswordForm from "../../Components/UpdatePassword";
import {
  Shield,
  User,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Star
} from "lucide-react";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Profile = ({ user }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-600">Loading profile…</p>
      </div>
    );
  }

  const profile = user.tutorProfile || {};
  const socials = profile.socialLinks || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-36 relative">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-end">
          <div className="flex items-center gap-5 -mb-10">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-700 shadow">
              {getInitials(user.name)}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm opacity-90">
                {profile.headline || "Instructor"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== Left Column ===== */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Instructor Stats
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Students</p>
                <p className="font-bold">1,250</p>
              </div>
              <div>
                <p className="text-gray-500">Courses</p>
                <p className="font-bold">8</p>
              </div>
              <div>
                <p className="text-gray-500">Rating</p>
                <p className="font-bold flex items-center gap-1">
                  4.8 <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </p>
              </div>
              <div>
                <p className="text-gray-500">Reviews</p>
                <p className="font-bold">156</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border shadow-sm p-4 space-y-2 text-sm">
            <p className="font-semibold text-gray-800 mb-2">Contact</p>

            {profile.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" /> {profile.location}
              </div>
            )}

            {socials.website && (
              <a
                href={socials.website}
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Globe className="w-4 h-4" /> Website
              </a>
            )}

            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}

            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Twitter className="w-4 h-4" /> Twitter
              </a>
            )}
          </div>

          {/* Expertise */}
          {profile.expertise?.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs border border-blue-500 text-blue-600 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== Right Column ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              About Me
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setTabIndex(0)}
                className={`flex-1 py-3 flex items-center justify-center gap-2 ${
                  tabIndex === 0
                    ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                <User className="w-4 h-4" />
                Edit Profile
              </button>

              <button
                onClick={() => setTabIndex(1)}
                className={`flex-1 py-3 flex items-center justify-center gap-2 ${
                  tabIndex === 1
                    ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                <Shield className="w-4 h-4" />
                Security
              </button>
            </div>

            <div className="p-6">
              {tabIndex === 0 && <EditProfileForm user={user} />}
              {tabIndex === 1 && <UpdatePasswordForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
