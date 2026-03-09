const Analytics = require('../models/Analytics');
const Project = require('../models/Project');
const Feedback = require('../models/Feedback');

exports.getAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    
    if (!analytics) {
      const projectCount = await Project.countDocuments();
      const feedbackCount = await Feedback.countDocuments();
      const topProjectFeedback = await Feedback.aggregate([
        { $group: { _id: '$projectId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);
      
      let topProjectName = 'N/A';
      if (topProjectFeedback.length > 0) {
        const topProject = await Project.findById(topProjectFeedback[0]._id);
        topProjectName = topProject ? topProject.name : 'N/A';
      }
      
      analytics = await Analytics.create({
        citizensReached: Math.floor(Math.random() * 10000) + 5000,
        engagementRate: Math.floor(Math.random() * 30) + 60,
        feedbackCollected: feedbackCount,
        topProject: topProjectName
      });
    }
    
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
