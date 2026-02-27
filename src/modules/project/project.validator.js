const { PROJECT_STATUS } = require("../../config/constants");

/**
 * Validates project input payload
 * Designed for GeoJSON-based schema
 */
module.exports.validateProjectInput = (data) => {
  const errors = [];

  // Title validation
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.push("Title is required and must be a non-empty string");
  }

  // Department validation
  if (!data.department || typeof data.department !== "string") {
    errors.push("Department is required and must be a string");
  }

  // Location validation (GeoJSON)
  if (
    !data.location ||
    data.location.type !== "Point" ||
    !Array.isArray(data.location.coordinates) ||
    data.location.coordinates.length !== 2
  ) {
    errors.push(
      "Location must be a GeoJSON Point with coordinates [longitude, latitude]"
    );
  } else {
    const [lng, lat] = data.location.coordinates;

    if (typeof lng !== "number" || typeof lat !== "number") {
      errors.push("Longitude and latitude must be numbers");
    }

    if (lat < -90 || lat > 90) {
      errors.push("Latitude must be between -90 and 90");
    }

    if (lng < -180 || lng > 180) {
      errors.push("Longitude must be between -180 and 180");
    }
  }

  // Radius validation
  if (
    typeof data.radius !== "number" ||
    data.radius < 10 ||
    data.radius > 5000
  ) {
    errors.push("Radius must be a number between 10 and 5000 meters");
  }

  // Status validation (optional field)
  if (
    data.status &&
    !Object.values(PROJECT_STATUS).includes(data.status)
  ) {
    errors.push("Invalid project status");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};