import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  LibraryBooks as LibraryBooksIcon,
  People as PeopleIcon,
  Paid as PaidIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";


const tutorMenu = [
  { text: "Dashboard", icon: <DashboardIcon />, route: "/tutor/dashboard" },
  { text: "Create Course", icon: <CreateIcon />, route: "/tutor/create-course" },
  { text: "My Courses", icon: <LibraryBooksIcon />, route: "/tutor/courses" },
  { text: "Enrolled Students", icon: <PeopleIcon />, route: "/tutor/students" },
  { text: "Earnings", icon: <PaidIcon />, route: "/tutor/earnings" },
  { text: "Profile", icon: <PersonIcon />, route: "/tutor/profile" },
];
const Sidebar = ({ onSelect, selectedRoute }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`
        ${collapsed ? "w-20" : "w-64"}
        bg-gradient-to-b from-gray-950 via-gray-900 to-black
        text-white flex flex-col h-screen sticky top-0
        border-r border-gray-800 shadow-2xl
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <SchoolIcon />
            </div>
            <div>
              <h2 className="text-lg font-bold">Learnify</h2>
              <p className="text-xs text-gray-400">Tutor Panel</p>
            </div>
          </div>
        )}

        {/* <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          <MenuIcon />
        </button> */}
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1">
        <ul className="space-y-2">
          {tutorMenu.map((item, index) => {
            const isSelected = item.route === selectedRoute;

            return (
              <li key={index}>
                <button
                  onClick={() => onSelect(item.route)}
                  className={`
                    group relative w-full flex items-center
                    ${collapsed ? "justify-center" : "gap-4"}
                    px-4 py-3 rounded-xl
                    transition-all duration-300
                    ${
                      isSelected
                        ? "bg-blue-600/15 text-blue-400"
                        : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></span>
                  )}

                  {/* Icon */}
                  <span
                    className={`
                      transition-all duration-300
                      ${
                        isSelected
                          ? "text-blue-400 scale-110"
                          : "text-gray-500 group-hover:text-white"
                      }
                    `}
                  >
                    {React.cloneElement(item.icon, {
                      fontSize: "medium",
                    })}
                  </span>

                  {/* Text */}
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1">
                      {item.text}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-6 border-t border-gray-800 text-xs text-gray-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
          <p>Tutor Dashboard v1.0</p>
        </div>
      )}
    </div>
  );
};
 export default Sidebar;