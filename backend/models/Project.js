const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  ward: { type: String, required: true },
  category: { type: String, required: true },
  beforeImage: { type: String, required: true },
  afterImage: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  completionDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
