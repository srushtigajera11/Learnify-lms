const StatCard = ({ title, value, icon, color = "#6366f1" }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div 
          className="p-3 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;