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
  const { heroPanel, slidingText, topHeaderText, offerPanel, contactInfo, paymentInfo, termsAndConditions, privacyPolicy } = req.body;

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

    } else {
      homePageData = new HomePage({ heroPanel, slidingText, topHeaderText, offerPanel, contactInfo, paymentInfo, termsAndConditions, privacyPolicy });
    }

    await homePageData.save();
    res.json({ message: "HomePage data updated successfully", homePageData });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
