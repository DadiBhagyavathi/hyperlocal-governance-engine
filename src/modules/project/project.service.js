const Project = require("./project.model");

/**
 * Create a new project
 */
exports.createProject = async (data) => {
  return Project.create(data);
};

/**
 * Get paginated list of active projects
 * Supports safe pagination handling
 */
exports.getAllProjects = async (page, limit) => {
  // Safe defaults if undefined
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  // Ensure valid values
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    Project.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Project.countDocuments({ isActive: true }),
  ]);

  return {
    data: projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};