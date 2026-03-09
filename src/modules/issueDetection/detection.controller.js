const service = require('./detection.service');

exports.reportComplaint = async (req, res, next) => {
  try {
    const complaint = await service.reportComplaint(req.body);
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

exports.getClusters = async (req, res, next) => {
  try {
    const clusters = await service.detectClusters();
    res.json({ success: true, data: clusters });
  } catch (err) {
    next(err);
  }
};
