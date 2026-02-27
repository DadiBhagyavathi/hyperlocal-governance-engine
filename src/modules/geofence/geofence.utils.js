const { isInsideGeoFence } = require("../../utils/geoMath");

module.exports.validateGeoFence = ({
  userLat,
  userLng,
  project,
}) => {
  return isInsideGeoFence(
    userLat,
    userLng,
    project.latitude,
    project.longitude,
    project.radius
  );
};