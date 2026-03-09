const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  citizenName: { type: String, required: true },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  ward: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
