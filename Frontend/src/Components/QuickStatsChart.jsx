import React from 'react';
import { 
  People, 
  CheckCircle, 
  Help, 
  TrendingUp, 
  Star 
} from '@mui/icons-material';

const stats = [
  { icon: <People className="text-blue-600" />, value: '12', label: 'New Enrollments', trend: '+8%' },
  { icon: <CheckCircle className="text-green-600" />, value: '7', label: 'Course Completions', trend: '+3%' },
  { icon: <Help className="text-purple-600" />, value: '23', label: 'New Questions', trend: '+15%' },
  { icon: <Star className="text-yellow-600" />, value: '5', label: 'Positive Reviews', trend: '+10%' },
];

const QuickStatsChart = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          This Week's Activity
        </h2>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="mr-1" fontSize="small" />
                <span className="text-sm font-medium">
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickStatsChart;