const Project = require("../modules/project/project.model");
const logger = require("../config/logger");

/**
 * Soft-cleans completed projects older than threshold
 * Industry best practice: Avoid hard deletes
 */
exports.cleanupOldProjects = async () => {
  try {
    const RETENTION_DAYS = 30;
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const result = await Project.updateMany(
      {
        status: "completed",
        updatedAt: { $lt: cutoff },
        isActive: true,
      },
      {
        $set: { isActive: false },
      }
    );

    logger.info("Project cleanup job executed", {
      retentionDays: RETENTION_DAYS,
      affectedProjects: result.modifiedCount,
    });

    return {
      retentionDays: RETENTION_DAYS,
      affectedProjects: result.modifiedCount,
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Project cleanup job failed", {
      error: error.message,
    });

    throw error;
  }
};