const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  citizensReached: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  feedbackCollected: { type: Number, default: 0 },
  topProject: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
