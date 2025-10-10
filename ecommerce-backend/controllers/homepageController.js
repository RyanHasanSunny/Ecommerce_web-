const HomePage = require('../models/homepageModel');

// Get the homepage data
exports.getHomePage = async (req, res) => {
  try {
    const homePageData = await HomePage.findOne();
    if (!homePageData) {
      return res.status(404).json({ message: "HomePage data not found" });
    }
    res.json(homePageData);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update homepage data
exports.updateHomePage = async (req, res) => {
  const { heroPanel, slidingText, topHeaderText, offerPanel, contactInfo, paymentInfo, termsAndConditions, privacyPolicy, promoEnabled, promoCodes } = req.body;

  try {
    let homePageData = await HomePage.findOne();

    if (homePageData) {
      homePageData.heroPanel = heroPanel || homePageData.heroPanel;
      homePageData.slidingText = slidingText || homePageData.slidingText;
      homePageData.topHeaderText = topHeaderText || homePageData.topHeaderText;
      homePageData.offerPanel = offerPanel || homePageData.offerPanel;
      homePageData.contactInfo = contactInfo || homePageData.contactInfo;
      homePageData.paymentInfo = paymentInfo || homePageData.paymentInfo;
      homePageData.termsAndConditions = termsAndConditions || homePageData.termsAndConditions;
      homePageData.privacyPolicy = privacyPolicy || homePageData.privacyPolicy;
      if (promoEnabled !== undefined) homePageData.promoEnabled = promoEnabled;
      if (promoCodes !== undefined) homePageData.promoCodes = promoCodes;

    } else {
      homePageData = new HomePage({ heroPanel, slidingText, topHeaderText, offerPanel, contactInfo, paymentInfo, termsAndConditions, privacyPolicy, promoEnabled, promoCodes });
    }

    await homePageData.save();
    res.json({ message: "HomePage data updated successfully", homePageData });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Toggle promo enabled status (Admin only)
exports.togglePromoEnabled = async (req, res) => {
  try {
    const { promoEnabled } = req.body;

    let homePageData = await HomePage.findOne();
    if (!homePageData) {
      homePageData = new HomePage({ promoEnabled: promoEnabled || false });
    } else {
      homePageData.promoEnabled = promoEnabled !== undefined ? promoEnabled : !homePageData.promoEnabled;
    }

    await homePageData.save();

    res.json({
      success: true,
      msg: `Promo codes ${homePageData.promoEnabled ? 'enabled' : 'disabled'} successfully`,
      promoEnabled: homePageData.promoEnabled
    });
  } catch (err) {
    console.error('togglePromoEnabled error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
