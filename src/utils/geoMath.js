const { GEO } = require("../config/constants");

/**
 * Converts degrees to radians
 */
const toRadians = (degrees) => degrees * (Math.PI / 180);

/**
 * Calculates distance between two geo points (meters)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    [lat1, lon1, lat2, lon2].some(
      (v) => typeof v !== "number" || Number.isNaN(v)
    )
  ) {
    throw new Error("Invalid coordinates provided");
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return GEO.EARTH_RADIUS_METERS * c;
};

/**
 * Checks if user is inside geo-fence
 */
const isInsideGeoFence = (userLat, userLng, centerLat, centerLng, radius) => {
  const distance = calculateDistance(
    userLat,
    userLng,
    centerLat,
    centerLng
  );
  return distance <= radius;
};

module.exports = {
  calculateDistance,
  isInsideGeoFence,
};