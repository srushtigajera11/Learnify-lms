import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
import { useAuth } from "../Context/AuthContext";

const TutorDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState(location.pathname);
  const { user } = useAuth();

  const handleSelect = (route) => {
    setSelectedRoute(route);
    navigate(route);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar onSelect={handleSelect} selectedRoute={selectedRoute} />
      </div>

      {/* Main section - with sidebar offset */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-20">
          <Header />
        </div>
        
        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6 min-w-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet context={user} />
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default TutorDashboardLayout;