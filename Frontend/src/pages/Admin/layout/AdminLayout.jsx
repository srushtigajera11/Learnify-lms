import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useState } from "react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Fixed with proper width */}
      <div className="hidden lg:block">
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 bg-gray-50 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;