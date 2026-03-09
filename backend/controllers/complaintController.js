const Complaint = require('../models/Complaint');

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.detectIssueClusters = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    const clusters = {};
    
    complaints.forEach(c => {
      const key = `${c.ward}|${c.issueType}`;
      if (!clusters[key]) {
        clusters[key] = { ward: c.ward, issueType: c.issueType, count: 0, complaints: [] };
      }
      clusters[key].count++;
      clusters[key].complaints.push(c);
    });
    
    const alerts = Object.values(clusters)
      .filter(cluster => cluster.count > 5)
      .map(cluster => ({
        alert: '⚠ High Complaint Cluster Detected',
        location: cluster.ward,
        issue: cluster.issueType,
        complaints: cluster.count,
        severity: cluster.count > 10 ? 'Critical' : 'High'
      }));
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
