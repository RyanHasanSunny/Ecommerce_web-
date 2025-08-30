const mongoose = require('mongoose');

// Define the schema for the homepage data
const HomePageSchema = new mongoose.Schema({
  heroPanel: [{
    imageUrl: { type: String, required: true },
    altText: { type: String, required: true }
  }],
  slidingText: [{
    text: { type: String, required: true }
  }],
  topHeaderText: { type: String, default: '24/7 Support Available' },
  offerPanel: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    isEnabled: { type: Boolean, default: true }
  },
  contactInfo: {
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    socialLinks: [{
      platform: { type: String, required: true },
      url: { type: String, required: true },
      contactLink: { type: String, required: true }
    }],
    socialmediaContact: [{
      socialMedia: { type: String, required: true },
      socialmediaLink: { type: String, required: true }
    }],
    location: { type: String, required: true }
  },
  paymentInfo: {
    method: [{
      getway: { type: String, required: true },
      getwaynumber: { type: String, required: true }
    }]
  },
  termsAndConditions: {
    title: { type: String, default: 'Terms and Conditions' },
    content: { type: String, default: 'Default terms and conditions content...' },
    lastUpdated: { type: Date, default: Date.now }
  },
  privacyPolicy: {
    title: { type: String, default: 'Privacy Policy' },
    content: { type: String, default: 'Default privacy policy content...' },
    lastUpdated: { type: Date, default: Date.now }
  }
});

module.exports = mongoose.model('HomePage', HomePageSchema);
