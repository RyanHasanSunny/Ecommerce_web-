import React, { useEffect, useState } from 'react';
import apiService from '../api/api';

const ContactUs = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await apiService.getHomePage();
        if (response && response.contactInfo) {
          setContactInfo(response.contactInfo);
        } else {
          setError('Contact information not available.');
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError('Failed to load contact information.');
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading contact information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Email</h2>
          <p className="text-gray-700">{contactInfo.email}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Contact Number</h2>
          <p className="text-gray-700">{contactInfo.contactNumber}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Location</h2>
          <p className="text-gray-700">{contactInfo.location}</p>
        </div>
        {contactInfo.socialLinks && contactInfo.socialLinks.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Social Links</h2>
            <ul className="list-disc list-inside">
              {contactInfo.socialLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {contactInfo.socialmediaContact && contactInfo.socialmediaContact.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Social Media Contact</h2>
            <ul className="list-disc list-inside">
              {contactInfo.socialmediaContact.map((social, index) => (
                <li key={index}>
                  <a href={social.socialmediaLink} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {social.socialMedia}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUs;
