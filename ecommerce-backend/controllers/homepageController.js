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
  const { heroPanel, offerPanel, contactInfo, paymentInfo } = req.body;

  try {
    let homePageData = await HomePage.findOne();

    if (homePageData) {
      homePageData.heroPanel = heroPanel || homePageData.heroPanel;
      homePageData.offerPanel = offerPanel || homePageData.offerPanel;
      homePageData.contactInfo = contactInfo || homePageData.contactInfo;
      homePageData.paymentInfo = paymentInfo || homePageData.paymentInfo;
    } else {
      homePageData = new HomePage({ heroPanel, offerPanel, contactInfo, paymentInfo });
    }

    await homePageData.save();
    res.json({ message: "HomePage data updated successfully", homePageData });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
