// src/user-panel/components/footer/Footer.jsx - UPDATED WITH BACKEND DATA

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  CreditCard,
  Shield,
  Truck,
  Award
} from 'lucide-react';
import apiService from '../../api/api';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Track Order', href: '/track-order' },
      { name: 'Returns', href: '/returns' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' }
    ],
    categories: [
      { name: 'Electronics', href: '/products?category=electronics' },
      { name: 'Fashion', href: '/products?category=fashion' },
      { name: 'Home & Garden', href: '/products?category=home' },
      { name: 'Sports', href: '/products?category=sports' }
    ]
  };

  // Default social links with icons mapping
  const socialIconMap = {
    facebook: { icon: Facebook, color: 'hover:text-blue-600' },
    twitter: { icon: Twitter, color: 'hover:text-blue-400' },
    instagram: { icon: Instagram, color: 'hover:text-pink-600' },
    youtube: { icon: Youtube, color: 'hover:text-red-600' },
    linkedin: { icon: Facebook, color: 'hover:text-blue-700' } // Using Facebook as fallback for linkedin
  };

  const features = [
    { 
      icon: Truck, 
      title: 'Free Shipping', 
      description: 'On orders over $50' 
    },
    { 
      icon: Shield, 
      title: 'Secure Payment', 
      description: '100% protected payments' 
    },
    { 
      icon: Award, 
      title: 'Quality Guarantee', 
      description: 'Premium quality products' 
    },
    { 
      icon: Phone, 
      title: '24/7 Support', 
      description: 'Dedicated customer service' 
    }
  ];

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const response = await apiService.getHomePage();
        const homePageData = response.data || response;
        if (homePageData?.contactInfo) {
          setContactInfo(homePageData.contactInfo);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Use backend data if available, otherwise use defaults
  const displayEmail = contactInfo?.email || 'support@magicmart.com';
  const displayPhone = contactInfo?.contactNumber || '+1 (555) 123-4567';
  const displayLocation = contactInfo?.location || '123 Commerce Street, Business District, NY 10001';
  
  // Process social links from backend
  const socialLinks = contactInfo?.socialLinks?.map(link => {
    const socialData = socialIconMap[link.platform.toLowerCase()] || socialIconMap.facebook;
    return {
      name: link.platform,
      icon: socialData.icon,
      href: link.url,
      color: socialData.color
    };
  }) || [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-600' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', color: 'hover:text-red-600' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Features Section */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-between gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 w-full lg:w-1/3">
            <Link to="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MAGIC MART
              </h3>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your trusted e-commerce destination for quality products, competitive prices, and exceptional customer service. 
              We're committed to making your shopping experience magical.
            </p>
          </div>
          <div className="flex flex-col items-start space-x-4 mb-6">
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3 text-blue-600" />
                <span>{displayPhone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                <span>{displayEmail}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                <span>{displayLocation}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 transition-colors duration-200 ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © {currentYear} Magic Mart. All rights reserved.
              </p>
              <div className="flex space-x-4">
                {footerLinks.legal.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;