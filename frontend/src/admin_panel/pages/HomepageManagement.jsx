import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Image, Share2, Info, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { CreditCard } from 'lucide-react';

// Mock API service - replace with your actual API
const apiService = {
  baseURL: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...(options.headers || {}) };

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      headers['x-auth-token'] = token;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.message || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  },

  async getHomePage() {
    return this.request('/homepagedata');
  },

  async updateHomePage(homePageData) {
    return this.request('/homepagedata', {
      method: 'POST',
      body: JSON.stringify(homePageData)
    });
  },

  async uploadMultipleImages(imageFiles) {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    return this.request('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }
};

const EnhancedImageUpload = ({ images = [], onImagesChange, maxImages = 5, title = "Images", uploading = false }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files) => {
    if (files.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      const response = await apiService.uploadMultipleImages(files);
      const uploadedImages = response.data.images.map(img => ({
        url: img.mainImage.url,
        fileName: img.mainImage.fileName,
        altText: img.originalName
      }));

      onImagesChange([...images, ...uploadedImages]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images: ' + error.message);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleAltTextChange = (index, altText) => {
    const newImages = images.map((img, i) =>
      i === index ? { ...img, altText } : img
    );
    onImagesChange(newImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-gray-500">{images.length}/{maxImages}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group bg-white rounded-lg shadow-md overflow-hidden border">
            <img
              src={image.url || image.imageUrl}
              alt={image.altText}
              className="w-full h-32 object-cover"
            />
            <div className="p-2">
              <input
                type="text"
                value={image.altText}
                onChange={(e) => handleAltTextChange(index, e.target.value)}
                placeholder="Image description"
                className="w-full text-xs p-1 border rounded"
              />
            </div>
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onClick={() => document.getElementById('imageInput')?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Image size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {dragActive ? 'Drop images here' : 'Click or drag images'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        id="imageInput"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

const AccordionSection = ({ title, icon: Icon, isExpanded, onToggle, badge, children }) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold">{title}</h3>
          {badge && (
            <span className={`px-2 py-1 text-xs rounded-full ${badge.type === 'success' ? 'bg-green-100 text-green-800' :
                badge.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
              }`}>
              {badge.text}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      {isExpanded && (
        <div className="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const SocialMediaField = ({ link, index, onUpdate, onRemove }) => {
  const socialPlatforms = [
    { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { value: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
  ];

  const selectedPlatform = socialPlatforms.find(p => p.value === link.platform) || socialPlatforms[0];

  return (
    <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select
            value={link.platform}
            onChange={(e) => onUpdate(index, 'platform', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {socialPlatforms.map(platform => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input
            type="url"
            value={link.url}
            onChange={(e) => onUpdate(index, 'url', e.target.value)}
            placeholder={`https://${link.platform}.com/yourprofile`}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <selectedPlatform.icon size={20} className={selectedPlatform.color} />
          <span className="text-sm font-medium">{selectedPlatform.label}</span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};


const PaymentMethodField = ({ method, index, onUpdate, onRemove }) => {
  const paymentMethods = [
    { value: 'bkash', label: 'bKash' },
    { value: 'nagad', label: 'Nagad' },
    { value: 'rocket', label: 'Rocket' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'card', label: 'Credit/Debit Card' },
  ];

  const selectedMethod = paymentMethods.find(p => p.value === method.getway) || paymentMethods[0];

  return (
    <div className="bg-green-50 p-4 rounded-lg space-y-4 border border-green-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={method.getway}
            onChange={(e) => onUpdate(index, 'getway', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {paymentMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
          <input
            type="text"
            value={method.getwaynumber}
            onChange={(e) => onUpdate(index, 'getwaynumber', e.target.value)}
            placeholder="Enter account/number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{selectedMethod.label}</span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};




const Alert = ({ type, message, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`p-4 rounded-lg border flex items-start space-x-3 ${colors[type]}`}>
      <Icon size={20} className="mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-current hover:opacity-70">
          ×
        </button>
      )}
    </div>
  );
};

const HomepageManagement = () => {
  const [homePageData, setHomePageData] = useState({
    heroPanel: [{
      imageUrl: '',
      altText: ''
    }],
    offerPanel: {
      title: '',
      description: '',
      isEnabled: true
    },
    contactInfo: {
      email: '',
      contactNumber: '',
      socialLinks: [],
      location: ''
    },
    paymentInfo: {
      method: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [expandedPanels, setExpandedPanels] = useState({
    hero: true,
    offer: false,
    contact: false,

  });

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getHomePage();
      if (response && response.data) {
        setHomePageData(response.data);
      } else if (response) {
        setHomePageData(response);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      showAlert('Failed to load homepage data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
  };

  const handlePanelToggle = (panel) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiService.updateHomePage(homePageData);
      if (response.success || response.msg) {
        showAlert('Homepage data updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating homepage:', error);
      showAlert('Failed to update homepage data: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImagesChange = (newImages) => {
    const heroPanel = newImages.map(img => ({
      imageUrl: img.url || img.imageUrl,
      altText: img.altText
    }));

    setHomePageData(prev => ({
      ...prev,
      heroPanel
    }));
  };

  const addSocialLink = () => {
    setHomePageData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        socialLinks: [
          ...prev.contactInfo.socialLinks,
          { platform: 'facebook', url: '' }
        ]
      }
    }));
  };

  const removeSocialLink = (index) => {
    setHomePageData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        socialLinks: prev.contactInfo.socialLinks.filter((_, i) => i !== index)
      }
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setHomePageData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        socialLinks: prev.contactInfo.socialLinks.map((link, i) =>
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };


  const addPaymentMethod = () => {
    setHomePageData(prev => ({
      ...prev,
      paymentInfo: {
        method: [
          ...prev.paymentInfo.method,
          { getway: 'bkash', getwaynumber: '' }
        ]
      }
    }));
  };

  const removePaymentMethod = (index) => {
    setHomePageData(prev => ({
      ...prev,
      paymentInfo: {
        method: prev.paymentInfo.method.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePaymentMethod = (index, field, value) => {
    setHomePageData(prev => ({
      ...prev,
      paymentInfo: {
        method: prev.paymentInfo.method.map((method, i) =>
          i === index ? { ...method, [field]: value } : method
        )
      }
    }));
  };






  const updateOfferPanel = (field, value) => {
    setHomePageData(prev => ({
      ...prev,
      offerPanel: {
        ...prev.offerPanel,
        [field]: value
      }
    }));
  };

  const updateContactInfo = (field, value) => {
    setHomePageData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const heroImages = homePageData.heroPanel.map(hero => ({
    url: hero.imageUrl,
    imageUrl: hero.imageUrl,
    altText: hero.altText
  }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading homepage data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Homepage Management</h1>
        <p className="text-gray-600">Customize your website's homepage content, images, and contact information</p>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false, message: '', type: 'info' })}
          />
        </div>
      )}

      {/* Hero Panel Section */}
      <AccordionSection
        title="Hero Panel"
        icon={Image}
        isExpanded={expandedPanels.hero}
        onToggle={() => handlePanelToggle('hero')}
        badge={{
          text: `${homePageData.heroPanel.length} Image${homePageData.heroPanel.length !== 1 ? 's' : ''}`,
          type: 'info'
        }}
      >
        <div className="space-y-6">
          <EnhancedImageUpload
            images={heroImages}
            onImagesChange={handleHeroImagesChange}
            maxImages={5}
            title="Hero Banner Images"
            uploading={uploading}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Hero Panel Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use high-quality images (recommended: 1920x1080px)</li>
              <li>• Add descriptive alt text for better SEO and accessibility</li>
              <li>• Maximum 5 images for optimal performance</li>
            </ul>
          </div>
        </div>
      </AccordionSection>

      {/* Offer Panel Section */}
      <AccordionSection
        title="Offer Panel"
        icon={Share2}
        isExpanded={expandedPanels.offer}
        onToggle={() => handlePanelToggle('offer')}
        badge={{
          text: homePageData.offerPanel.isEnabled ? 'Enabled' : 'Disabled',
          type: homePageData.offerPanel.isEnabled ? 'success' : 'warning'
        }}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
              <input
                type="text"
                value={homePageData.offerPanel.title}
                onChange={(e) => updateOfferPanel('title', e.target.value)}
                placeholder="Special Offer"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homePageData.offerPanel.isEnabled}
                  onChange={(e) => updateOfferPanel('isEnabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-10 h-6 rounded-full transition-colors ${homePageData.offerPanel.isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${homePageData.offerPanel.isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">Enable Offer Panel</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Description</label>
            <textarea
              value={homePageData.offerPanel.description}
              onChange={(e) => updateOfferPanel('description', e.target.value)}
              placeholder="Get amazing discounts on selected items"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </AccordionSection>

      {/* Contact Information Section */}
      <AccordionSection
        title="Contact Information"
        icon={Info}
        isExpanded={expandedPanels.contact}
        onToggle={() => handlePanelToggle('contact')}
        badge={{
          text: `${homePageData.contactInfo.socialLinks.length} Social Link${homePageData.contactInfo.socialLinks.length !== 1 ? 's' : ''}`,
          type: 'info'
        }}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Mail size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Contact Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={homePageData.contactInfo.email}
                  onChange={(e) => updateContactInfo('email', e.target.value)}
                  placeholder="info@yourstore.com"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={homePageData.contactInfo.contactNumber}
                  onChange={(e) => updateContactInfo('contactNumber', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Location</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={homePageData.contactInfo.location}
                  onChange={(e) => updateContactInfo('location', e.target.value)}
                  placeholder="New York, NY"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Share2 size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Social Media Links</h3>
              </div>
              <button
                onClick={addSocialLink}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add Social Link</span>
              </button>
            </div>

            {homePageData.contactInfo.socialLinks.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-600">No social media links added yet. Click "Add Social Link" to get started.</p>
              </div>
            )}

            <div className="space-y-4">
              {homePageData.contactInfo.socialLinks.map((link, index) => (
                <SocialMediaField
                  key={index}
                  link={link}
                  index={index}
                  onUpdate={updateSocialLink}
                  onRemove={removeSocialLink}
                />
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>


      <AccordionSection
        title="Payment Information"
        icon={CreditCard} // Make sure to import CreditCard from lucide-react
        isExpanded={expandedPanels.payment}
        onToggle={() => handlePanelToggle('payment')}
        badge={{
          text: `${homePageData.paymentInfo.method.length} Method${homePageData.paymentInfo.method.length !== 1 ? 's' : ''}`,
          type: 'info'
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CreditCard size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold">Payment Methods</h3>
            </div>
            <button
              onClick={addPaymentMethod}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              <span>Add Payment Method</span>
            </button>
          </div>

          {homePageData.paymentInfo.method.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-600">No payment methods added yet. Click "Add Payment Method" to get started.</p>
            </div>
          )}

          <div className="space-y-4">
            {homePageData.paymentInfo.method.map((method, index) => (
              <PaymentMethodField
                key={index}
                method={method}
                index={index}
                onUpdate={updatePaymentMethod}
                onRemove={removePaymentMethod}
              />
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
};

export default HomepageManagement;