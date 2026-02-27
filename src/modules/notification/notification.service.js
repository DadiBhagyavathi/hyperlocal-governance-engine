const crypto = require("crypto");
const messages = require("./notification.mock");

/**
 * Selects a civic message based on department or project type
 */
const getCivicMessage = (project) => {
  if (!project || !project.department) {
    return messages.DEFAULT[0];
  }

  const key = project.department.toUpperCase();
  const options = messages[key] || messages.DEFAULT;

  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Builds structured notification payload
 * Industry-ready format for future push/SMS integration
 */
exports.buildNotification = (project) => {
  return {
    notificationId: crypto.randomUUID(), // Unique ID for traceability
    type: "CIVIC_INFO",
    projectId: project._id,
    title: project.title,
    message: getCivicMessage(project),
    createdAt: new Date().toISOString(),
  };
};

module.exports.getCivicMessage = getCivicMessage;