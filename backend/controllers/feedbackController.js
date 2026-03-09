const Feedback = require('../models/Feedback');

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('projectId').sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
