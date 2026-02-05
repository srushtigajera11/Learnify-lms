const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

const ProfileHeader = ({ user }) => {
  return (
    <div className="h-[140px] bg-gradient-to-r from-indigo-600 to-blue-500 relative mb-16">
      <div className="max-w-6xl mx-auto h-full px-4 relative">
        <div className="absolute -bottom-10 left-4 flex items-end gap-6">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-lg">
            {getInitials(user.name)}
          </div>

          <div className="text-white">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-sm opacity-90">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
