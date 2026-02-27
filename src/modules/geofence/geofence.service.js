const mongoose = require("mongoose");
const Project = require("../project/project.model");
const Engagement = require("../engagement/engagement.model");
const { buildNotification } = require("../notification/notification.service");

/**
 * Geo-Fence Processing Service
 * - Uses MongoDB 2dsphere query
 * - Uses transaction for engagement tracking
 * - Optimized and production-safe
 */
exports.processLocation = async (userLat, userLng) => {
  if (!userLat || !userLng) {
    throw new Error("Invalid location coordinates");
  }

  const userLocation = {
    type: "Point",
    coordinates: [userLng, userLat], // [lng, lat]
  };

  /**
   * Fetch nearby active in-progress projects
   */
  const projects = await Project.find({
    isActive: true,
    status: "in-progress",
    location: {
      $near: {
        $geometry: userLocation,
        $maxDistance: 5000,
      },
    },
  });

  const responses = [];

  for (const project of projects) {
    const [projLng, projLat] = project.location.coordinates;

    const distance = calculateDistance(
      userLat,
      userLng,
      projLat,
      projLng
    );

    if (distance <= project.radius) {
      /**
       * Start MongoDB transaction
       */
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Record engagement inside transaction
        await Engagement.create(
          [
            {
              projectId: project._id,
              location: {
                type: "Point",
                coordinates: [userLng, userLat],
              },
              source: "GEOFENCE",
              triggeredAt: new Date(),
            },
          ],
          { session }
        );

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

      responses.push({
        project: {
          id: project._id,
          title: project.title,
          department: project.department,
          status: project.status,
        },
        notification: buildNotification(project),
      });
    }
  }

  return responses;
};

/**
 * Haversine distance calculation
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const toRad = (val) => (val * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}