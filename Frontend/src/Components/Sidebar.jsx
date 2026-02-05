import React from "react";
import PropTypes from "prop-types";
import {
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  LibraryBooks as LibraryBooksIcon,
  People as PeopleIcon,
  Paid as PaidIcon,
  Person as PersonIcon,
  School as SchoolIcon,
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
  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-950 text-white flex flex-col h-screen sticky top-0 border-r border-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <SchoolIcon className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Learnify
            </h2>
            <p className="text-xs text-gray-400 mt-1">Tutor Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {tutorMenu.map((item, index) => {
            const isSelected = item.route === selectedRoute;
            return (
              <li key={index}>
                <button
                  onClick={() => onSelect(item.route)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl flex items-center gap-3
                    transition-all duration-200 relative
                    ${isSelected 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                    }
                    ${isSelected && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500 before:rounded-r-full'}
                  `}
                >
                  <span className={`
                    flex items-center justify-center
                    ${isSelected ? 'text-blue-400' : 'text-gray-500'}
                  `}>
                    {React.cloneElement(item.icon, {
                      fontSize: isSelected ? "medium" : "small"
                    })}
                  </span>
                  <span className={`
                    text-sm flex-1
                    ${isSelected ? 'font-semibold' : 'font-medium'}
                  `}>
                    {item.text}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
          <p>Tutor Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selectedRoute: PropTypes.string.isRequired,
};

export default Sidebar;