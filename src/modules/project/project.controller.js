const service = require("./project.service");

exports.create = async (req, res, next) => {
  try {
    const project = await service.createProject(req.body);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);   // ✅ now valid
  }
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await service.getAllProjects(page, limit);

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);  // ✅ now valid
  }
};