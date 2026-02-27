const { buildNotification } = require("./notification.service");

/**
 * Triggers structured civic notification
 * Can later integrate with push/SMS providers
 */
exports.triggerNotification = (project) => {
  if (!project) {
    throw new Error("Project data required for notification");
  }

  return buildNotification(project);
};