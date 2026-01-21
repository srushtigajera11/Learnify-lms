// AdminSidebar.jsx - Fixed version
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  GraduationCap,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const AdminSidebar = ({ selected, onSelect }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: "courses", label: "Courses", icon: <BookOpen className="w-5 h-5" /> },
    { key: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { key: "payments", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
    { key: "enrollments", label: "Enrollments", icon: <GraduationCap className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative
        fixed lg:static
        top-0 left-0 z-40
        w-64 h-screen bg-gray-900 text-gray-200
        flex flex-col
        transition-transform duration-300
        overflow-y-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-indigo-400">Learnify Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Control Panel</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    onSelect(item.key);
                    setSidebarOpen(false); // Close on mobile
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${selected === item.key
                      ? 'bg-gray-800 border-l-4 border-indigo-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    ${selected === item.key ? 'text-indigo-400' : 'text-gray-400'}
                  `}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="mt-auto px-2 pb-6 pt-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
};

export default AdminSidebar;