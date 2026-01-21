// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, Home, LogIn } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please check your credentials or contact support.
        </p>
        
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
          
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <LogIn className="w-5 h-5" />
            Sign In with Different Account
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;