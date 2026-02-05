import React from "react";

const TutorDashboardCard = ({ title, value, icon, color = "blue" }) => {
  const baseColors = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800"
  };

  const hoverColors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500"
  };

  return (
    <div className={`group relative p-4 rounded-xl border ${baseColors[color]} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}>
      {/* Animated background effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${hoverColors[color]}`}></div>
      
      <div className="relative flex items-center">
        {/* Icon Circle - Reduced size */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 transition-transform duration-300 group-hover:scale-110 ${
          color === 'blue' ? 'bg-blue-100' : 
          color === 'green' ? 'bg-green-100' : 
          color === 'purple' ? 'bg-purple-100' : 
          'bg-orange-100'
        }`}>
          <div className={`text-lg transition-transform duration-300 group-hover:scale-125 ${
            color === 'blue' ? 'text-blue-600' : 
            color === 'green' ? 'text-green-600' : 
            color === 'purple' ? 'text-purple-600' : 
            'text-orange-600'
          }`}>
            {icon}
          </div>
        </div>

        {/* Text Content */}
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider mb-1 transition-colors duration-300 group-hover:text-gray-900 ${
            color === 'blue' ? 'text-blue-700' : 
            color === 'green' ? 'text-green-700' : 
            color === 'purple' ? 'text-purple-700' : 
            'text-orange-700'
          }`}>
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 transition-transform duration-300 group-hover:translate-x-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboardCard;