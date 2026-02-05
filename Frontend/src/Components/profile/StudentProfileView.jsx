import { useState } from "react";
import EditProfileForm from "./EditProfileForm";
import UpdatePasswordForm from "./UpdatePassword";

const StudentProfileView = ({ user }) => {
  const [tab, setTab] = useState("profile");

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex border-b">
          {["profile", "security"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 font-medium ${
                tab === t
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600"
              }`}
            >
              {t === "profile" ? "Edit Profile" : "Change Password"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "profile" && <EditProfileForm user={user} />}
          {tab === "security" && <UpdatePasswordForm />}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;
