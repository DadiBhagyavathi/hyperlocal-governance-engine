const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000;
}

async function getProjectsInRange(userLat, userLon, radiusMeters = 5000) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: {
          in: ['PLANNING', 'IN_PROGRESS']
        }
      }
    });

    return projects.filter(project => {
      const distance = calculateDistance(
        userLat, userLon, 
        project.latitude, project.longitude
      );
      return distance <= Math.min(radiusMeters, project.radius);
    });
  } catch (error) {
    console.error('Geofencing error:', error);
    return [];
  }
}

module.exports = {
  calculateDistance,
  getProjectsInRange
};