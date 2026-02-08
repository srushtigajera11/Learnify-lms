import { useState } from "react";
import { useAuth } from "../../Context/authContext";
import EditProfileForm from "../../Components/EditProfileForm";
import UpdatePasswordForm from "../../Components/UpdatePassword";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? parts[0][0] + parts[1][0]
    : parts[0]?.[0] || "";
};

const Profile = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);

  /* ============================
     AUTH GUARDS
  ============================ */
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 text-center text-red-600">
        You must be logged in to view your profile.
      </div>
    );
  }

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT - PROFILE CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {getInitials(user.name)}
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {user.name}
          </h2>

          <p className="text-sm text-gray-500">
            {user.email}
          </p>

          <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {user.role}
          </span>

          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            Joined on{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* RIGHT - TABS */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setTabIndex(0)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                tabIndex === 0
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/40"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Edit Profile
            </button>

            <button
              onClick={() => setTabIndex(1)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                tabIndex === 1
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/40"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Change Password
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {tabIndex === 0 && <EditProfileForm user={user} />}
            {tabIndex === 1 && <UpdatePasswordForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
