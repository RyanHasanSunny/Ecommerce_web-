const mongoose = require('mongoose');

// Define the schema for the homepage data
const HomePageSchema = new mongoose.Schema({
  heroPanel: [{
    imageUrl: { type: String, required: true },
    altText: { type: String, required: true }
  }],
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
      url: { type: String, required: true }
    }],
    location: { type: String, required: true }
  },
  paymentInfo: {
    method: [{
      getway: {type: String, required: true},
      getwaynumber: {type: String, required: true}
    }]
  }
});

module.exports = mongoose.model('HomePage', HomePageSchema);
