import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import apiService from '../api/api';

const TermsandConditions = () => {
  const [termsAndConditions, setTermsAndConditions] = useState({
    title: 'Terms and Conditions',
    content: 'Loading terms and conditions...'
  });
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      try {
        const response = await apiService.getHomePage();
        if (response && response.termsAndConditions) {
          setTermsAndConditions(response.termsAndConditions);
        }
      } catch (error) {
        console.error('Error fetching terms and conditions:', error);
        setTermsAndConditions({
          title: 'Terms and Conditions',
          content: 'Failed to load terms and conditions content.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTermsAndConditions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terms and conditions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{termsAndConditions.title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {termsAndConditions.title}
              </h2>
              <p className="text-gray-600 text-lg">
                Last updated: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
              {termsAndConditions.content}
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              © {currentYear} Magic Mart. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <Link to="/privacy" className="text-blue-600 hover:text-blue-800 text-sm">
                Privacy Policy
              </Link>
              <Link to="/contact" className="text-blue-600 hover:text-blue-800 text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsandConditions;
