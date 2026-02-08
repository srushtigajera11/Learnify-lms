import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../Context/authContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "TU";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0][0];
  };

  /* ============================
     CLOSE ON OUTSIDE CLICK
  ============================ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/tutor/profile");
    setIsOpen(false);
  };

  return (
    <header className="bg-blue-950 border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center px-4 md:px-6 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses, students..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-200 hover:text-white">
            <NotificationsIcon />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-blue-950" />
          </button>

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white"
            >
              {getInitials(user?.name)}
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                {/* User Info */}
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name || "Tutor"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogoutIcon className="mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
                              