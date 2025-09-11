import React from 'react';
import { Loader } from 'lucide-react';

const InitialLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/magic.png"
          alt="Logo"
          className="w-24 h-24 object-contain animate-pulse"
        />
      </div>

      {/* Loading Animation */}
      <div className="flex flex-col items-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Loading Amazing Products
        </h2>
        <p className="text-gray-500 text-center max-w-xs">
          Please wait while we prepare everything for you...
        </p>

        {/* Progress Bar */}
        <div className="mt-6 w-64 bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse"
               style={{ width: '60%' }}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialLoader;
