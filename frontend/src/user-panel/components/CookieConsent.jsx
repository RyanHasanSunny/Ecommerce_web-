import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    // Enable all cookies/analytics here
    console.log('All cookies accepted');
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
    // Disable non-essential cookies here
    console.log('All cookies rejected');
  };

  const handleClose = () => {
    // Default to reject if closed without choice
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-200 shadow-2xl backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-blue-50 rounded-full flex-shrink-0">
              <Cookie className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                We Value Your Privacy
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-3">
                We use cookies to enhance your browsing experience, serve personalized content,
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm underline transition-colors">
                Learn more about our cookie policy
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={handleRejectAll}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-sm"
            >
              Reject All
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Accept All
            </button>
            <button
              onClick={handleClose}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              aria-label="Close cookie banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
