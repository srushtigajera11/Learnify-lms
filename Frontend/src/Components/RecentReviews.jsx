import React from 'react';
import { Avatar, Rating, Button } from '@mui/material';

const RecentReviews = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Reviews
        </h2>
        <div className="flex items-start gap-4">
          <Avatar 
            alt="Student" 
            src="https://i.pravatar.cc/48?u=student1" 
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <Rating value={4.5} precision={0.5} readOnly size="small" />
              <span className="ml-2 text-sm text-gray-600">4.5</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              He taught well and made topics to understand!
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentReviews;