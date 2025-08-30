import React, { useEffect, useState } from 'react';
import apiService from '../api/api';

const PrivacyPolicy = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState({
    title: 'Privacy Policy',
    content: 'Loading privacy policy...'
  });

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await apiService.getHomePage();
        if (response && response.privacyPolicy) {
          setPrivacyPolicy(response.privacyPolicy);
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        setPrivacyPolicy({
          title: 'Privacy Policy',
          content: 'Failed to load privacy policy content.'
        });
      }
    };

    fetchPrivacyPolicy();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{privacyPolicy.title}</h1>
      <div className="prose max-w-full whitespace-pre-wrap">
        {privacyPolicy.content}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
