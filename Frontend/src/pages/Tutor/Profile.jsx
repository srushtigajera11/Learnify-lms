import { useState } from "react";
import EditProfileForm from "../../Components/EditProfileForm";
import UpdatePasswordForm from "../../Components/UpdatePassword";
import {
  Shield,
  User,
  Calendar,
  Mail,
  Briefcase,
  Linkedin,
  Twitter,
  Globe,
  GraduationCap,
  MapPin,
  Star
} from "lucide-react";

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
};

const Profile = ({ user }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!user) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <p className="text-lg">Loading...</p>
    </div>
  );

  // Mock data for demonstration
  const profileData = {
    bio: "Senior Full Stack Developer with 5+ years of experience in React, Node.js, and MongoDB. Passionate about teaching and creating impactful learning experiences.",
    location: "San Francisco, CA",
    website: "https://john-doe-portfolio.com",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    expertise: ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript", "Express", "HTML/CSS", "REST APIs"],
    students: 1250,
    courses: 8,
    rating: 4.8,
    reviews: 156
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div 
        className="h-[140px] relative mb-16"
        style={{
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto h-full relative px-4">
          <div className="absolute -bottom-10 left-6 flex items-end gap-6">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-700 border-4 border-white shadow-lg">
              {getInitials(user.name)}
            </div>
            
            <div className="mb-1 text-white">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-full">
                  INSTRUCTOR
                </span>
                <span className="text-sm opacity-90">
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8 -mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {/* Instructor Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                  Instructor Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Students</span>
                    <span className="text-sm font-bold">{profileData.students.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Courses</span>
                    <span className="text-sm font-bold">{profileData.courses}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{profileData.rating}</span>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Reviews</span>
                    <span className="text-sm font-bold">{profileData.reviews}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Links Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">
                Contact & Links
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 truncate">{user.email}</span>
                </div>
                {profileData.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">Portfolio Website</span>
                  </div>
                )}
                {profileData.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">LinkedIn Profile</span>
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">{profileData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Expertise Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">
                Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-2 scrollbar-thin">
                {profileData.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 border border-blue-500 text-blue-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                About Me
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {profileData.bio}
              </p>
            </div>

            {/* Settings Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tabs Header */}
              <div className="border-b border-gray-200 bg-blue-50/30">
                <div className="flex">
                  <button
                    onClick={() => setTabIndex(0)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
                      tabIndex === 0 
                        ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50/50' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setTabIndex(1)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
                      tabIndex === 1 
                        ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50/50' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Security & Password
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 min-h-[320px]">
                {tabIndex === 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-4">
                      Personal Information
                    </h3>
                    <EditProfileForm user={user} />
                  </div>
                )}
                
                {tabIndex === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-4">
                      Security Settings
                    </h3>
                    <UpdatePasswordForm />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;