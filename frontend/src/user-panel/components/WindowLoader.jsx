// src/components/WindowLoader.jsx

import React from 'react';
import { Loader, CheckCircle } from 'lucide-react';

const WindowLoader = ({ 
  isVisible = false, 
  message = 'Loading...', 
  success = false,
  successMessage = 'Success!',
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center transform transition-all duration-300 scale-100">
        <div className="mb-6">
          {success ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {success ? successMessage : message}
          </h3>
          
          {!success && (
            <p className="text-gray-600 text-sm">
              Please wait while we process your request...
            </p>
          )}
        </div>
        
        {/* Progress bar */}
        {!success && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full progress-bar"
            ></div>
          </div>
        )}

        {success && onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .progress-bar {
            animation: progress 2s ease-in-out infinite;
          }
          
          @keyframes progress {
            0% { width: 20%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `
      }} />
    </div>
  );
};

export default WindowLoader;

