const service = require('./proof.service');

exports.uploadProof = async (req, res, next) => {
  try {
    const proof = await service.uploadProof(req.body);
    res.status(201).json({ success: true, data: proof });
  } catch (err) {
    next(err);
  }
};

exports.getProof = async (req, res, next) => {
  try {
    const proof = await service.getProof(req.params.projectId);
    res.json({ success: true, data: proof });
  } catch (err) {
    next(err);
  }
};

exports.getAllProofs = async (req, res, next) => {
  try {
    const proofs = await service.getAllProofs();
    res.json({ success: true, data: proofs });
  } catch (err) {
    next(err);
  }
};
